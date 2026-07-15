"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import type { Paginated, Reservation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "default",
  seated: "success",
  completed: "neutral",
  cancelled: "danger",
  no_show: "danger",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "seated",
  seated: "completed",
};

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    reserved_at: "",
    party_size: 2,
  });

  const load = useCallback(() => {
    api
      .get<Paginated<Reservation>>("/reservations?upcoming=0")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/reservations", form);
      toast("Réservation créée.", "success");
      setOpen(false);
      setForm({ guest_name: "", guest_phone: "", reserved_at: "", party_size: 2 });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  }

  async function advance(r: Reservation) {
    const next = NEXT_STATUS[r.status];
    if (!next) return;
    try {
      await api.put(`/reservations/${r.code}`, { status: next });
      load();
    } catch {
      toast("Impossible de mettre à jour.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Réservations"
        description="Suivez et gérez les réservations de votre restaurant."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nouvelle réservation
          </Button>
        }
      />

      {!items ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground">
          Aucune réservation pour le moment.
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {items.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {r.guest_name ?? "Client"}{" "}
                  <span className="text-sm text-muted-foreground">
                    · {r.party_size} pers.
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(r.reserved_at)}
                  {r.table ? ` · ${r.table.name}` : ""}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status}</Badge>
              {NEXT_STATUS[r.status] && (
                <Button size="sm" variant="outline" onClick={() => advance(r)}>
                  → {NEXT_STATUS[r.status]}
                </Button>
              )}
            </div>
          ))}
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nouvelle réservation">
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gn">Nom du client</Label>
            <Input
              id="gn"
              required
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gp">Téléphone</Label>
            <Input
              id="gp"
              value={form.guest_phone}
              onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ra">Date &amp; heure</Label>
              <Input
                id="ra"
                type="datetime-local"
                required
                value={form.reserved_at}
                onChange={(e) => setForm({ ...form, reserved_at: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ps">Personnes</Label>
              <Input
                id="ps"
                type="number"
                min={1}
                value={form.party_size}
                onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Enregistrement…" : "Créer la réservation"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

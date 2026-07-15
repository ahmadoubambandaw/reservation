"use client";

import { Gift, Plus } from "lucide-react";
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
import type { Paginated } from "@/lib/types";

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  loyalty_points: number;
  visits_count: number;
}

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const load = useCallback(() => {
    api
      .get<Paginated<Customer>>("/customers")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/customers", form);
      toast("Client ajouté.", "success");
      setOpen(false);
      setForm({ name: "", phone: "", email: "" });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Votre base clients, fidélité et historique."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Ajouter un client
          </Button>
        }
      />

      {!items ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground">
          Aucun client enregistré pour le moment.
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {items.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.phone ?? c.email ?? "—"} · {c.visits_count} visite(s)
                </p>
              </div>
              <Badge variant="default">
                <Gift className="size-3" /> {c.loyalty_points} pts
              </Badge>
            </div>
          ))}
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nouveau client">
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cn">Nom</Label>
            <Input id="cn" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp">Téléphone</Label>
            <Input id="cp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce">Email</Label>
            <Input id="ce" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Enregistrement…" : "Ajouter"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

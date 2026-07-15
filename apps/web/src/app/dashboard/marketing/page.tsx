"use client";

import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Plus, Send, Smartphone } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import type { Campaign, Paginated } from "@/lib/types";

const CHANNELS = [
  { key: "sms", label: "SMS", icon: Smartphone },
  { key: "email", label: "Email", icon: Mail },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "push", label: "Push", icon: Send },
];
const AUDIENCES = [
  { key: "all", label: "Tous les clients" },
  { key: "loyalty", label: "Clients fidèles" },
  { key: "birthday", label: "Anniversaires du jour" },
];

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "neutral"> = {
  draft: "neutral",
  scheduled: "warning",
  sending: "warning",
  sent: "success",
  failed: "neutral",
};

export default function MarketingPage() {
  const { hasModule, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channel: "sms",
    audience: "all",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!loading && !hasModule("marketing")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    api.get<Paginated<Campaign>>("/campaigns").then((r) => setCampaigns(r.data)).catch(() => setCampaigns([]));
  }, []);

  useEffect(load, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/campaigns", form);
      toast("Campagne créée.", "success");
      setOpen(false);
      setForm({ name: "", channel: "sms", audience: "all", subject: "", message: "" });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function send(c: Campaign) {
    try {
      const r = await api.post<{ message: string }>(`/campaigns/${c.id}/send`);
      toast(r.message ?? "Campagne envoyée.", "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Erreur", "error");
    }
  }

  async function previewAudience(c: Campaign) {
    try {
      const r = await api.get<{ recipients: number }>(`/campaigns/${c.id}/audience`);
      toast(`${r.recipients} destinataire(s) ciblé(s).`, "info");
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Campagnes SMS, Email, WhatsApp et Push vers vos clients."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nouvelle campagne
          </Button>
        }
      />

      {!campaigns ? (
        <Skeleton className="h-64 w-full" />
      ) : campaigns.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground">
          Aucune campagne. Créez votre première campagne pour toucher vos clients.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const channel = CHANNELS.find((ch) => ch.key === c.channel);
            const Icon = channel?.icon ?? Send;
            return (
              <Card key={c.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant={STATUS_VARIANT[c.status] ?? "neutral"}>{c.status}</Badge>
                </div>
                <h3 className="mt-3 font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {channel?.label} · {AUDIENCES.find((a) => a.key === c.audience)?.label}
                </p>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{c.message}</p>
                {c.status === "sent" ? (
                  <p className="mt-3 text-xs text-success">
                    Envoyée à {c.recipients_count} destinataire(s)
                  </p>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => previewAudience(c)}>
                      Audience
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => send(c)}>
                      <Send className="size-4" /> Envoyer
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nouvelle campagne">
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Canal</Label>
            <div className="grid grid-cols-4 gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => setForm({ ...form, channel: ch.key })}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors ${
                    form.channel === ch.key ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  <ch.icon className="size-4" />
                  {ch.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              {AUDIENCES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          {form.channel === "email" && (
            <div className="space-y-1.5">
              <Label>Objet</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Message</Label>
            <textarea
              required
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Création…" : "Créer la campagne"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

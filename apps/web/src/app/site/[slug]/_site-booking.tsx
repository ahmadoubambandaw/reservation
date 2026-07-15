"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";

export function SiteBooking({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ guest_name: "", guest_phone: "", reserved_at: "", party_size: 2 });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/restaurants/${slug}/reservations`, form);
      toast("Réservation envoyée ! Vous recevrez une confirmation.", "success");
      setForm({ guest_name: "", guest_phone: "", reserved_at: "", party_size: 2 });
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bn">Nom</Label>
          <Input id="bn" required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bp">Téléphone</Label>
          <Input id="bp" required value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bd">Date &amp; heure</Label>
          <Input id="bd" type="datetime-local" required value={form.reserved_at} onChange={(e) => setForm({ ...form, reserved_at: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bs">Personnes</Label>
          <Input id="bs" type="number" min={1} max={50} required value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-[var(--brand)] font-medium text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? "Envoi…" : "Confirmer la réservation"}
      </button>
    </form>
  );
}

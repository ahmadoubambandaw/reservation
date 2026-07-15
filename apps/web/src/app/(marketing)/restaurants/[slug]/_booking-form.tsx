"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingForm({
  onSubmit,
}: {
  onSubmit: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    reserved_at: "",
    party_size: 2,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onSubmit(form);
    setLoading(false);
    if (ok) setForm({ guest_name: "", guest_phone: "", reserved_at: "", party_size: 2 });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver une table</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              required
              value={form.guest_name}
              onChange={(e) => set("guest_name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              required
              value={form.guest_phone}
              onChange={(e) => set("guest_phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date &amp; heure</Label>
            <Input
              id="date"
              type="datetime-local"
              required
              value={form.reserved_at}
              onChange={(e) => set("reserved_at", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="party">Nombre de personnes</Label>
            <Input
              id="party"
              type="number"
              min={1}
              max={50}
              required
              value={form.party_size}
              onChange={(e) => set("party_size", Number(e.target.value))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi…" : "Confirmer la réservation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Globe, Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Restaurant } from "@/lib/types";
import { cn } from "@/lib/utils";

const THEMES = [
  { key: "light", label: "Clair" },
  { key: "dark", label: "Sombre" },
  { key: "system", label: "Système" },
];

export default function SettingsPage() {
  const { hasModule, loading, refresh } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    theme: "system",
    primary_color: "#4f46e5",
    secondary_color: "#f59e0b",
    logo: "",
    cover: "",
    custom_domain: "",
  });

  useEffect(() => {
    if (!loading && !hasModule("settings")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    api
      .get<{ data: Restaurant }>("/settings/branding")
      .then((r) => {
        const b = r.data.branding;
        setForm({
          theme: b?.theme ?? "system",
          primary_color: b?.primary_color ?? "#4f46e5",
          secondary_color: b?.secondary_color ?? "#f59e0b",
          logo: r.data.logo ?? "",
          cover: r.data.cover ?? "",
          custom_domain: b?.custom_domain ?? "",
        });
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(load, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/settings/branding", {
        theme: form.theme,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        logo: form.logo || null,
        cover: form.cover || null,
        custom_domain: form.custom_domain || null,
      });
      toast("Paramètres enregistrés.", "success");
      await refresh();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div>
        <PageHeader title="Paramètres" description="Apparence et domaine." />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Paramètres" description="Personnalisez l'apparence et le domaine de votre espace." />

      <form onSubmit={save} className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5 text-primary" /> Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Thème par défaut</Label>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setForm({ ...form, theme: t.key })}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm transition-colors",
                        form.theme === t.key ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Couleur principale</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
                    />
                    <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Couleur secondaire</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
                    />
                    <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <ImageUpload
                    type="logo"
                    aspect="square"
                    value={form.logo || null}
                    onChange={(url) => setForm({ ...form, logo: url ?? "" })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Image de couverture</Label>
                  <ImageUpload
                    type="cover"
                    aspect="wide"
                    value={form.cover || null}
                    onChange={(url) => setForm({ ...form, cover: url ?? "" })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5 text-primary" /> Domaine personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Domaine</Label>
                <Input
                  value={form.custom_domain}
                  onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
                  placeholder="reservations.mon-resto.com"
                />
                <p className="text-xs text-muted-foreground">
                  Faites pointer un enregistrement CNAME vers Ndaw-Resto pour activer votre domaine.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="h-20" style={{ background: `linear-gradient(120deg, ${form.primary_color}, ${form.secondary_color})` }} />
            <CardContent className="pt-5">
              <p className="text-sm font-medium">Aperçu</p>
              <div className="mt-3 space-y-2">
                <div className="h-9 rounded-lg" style={{ background: form.primary_color }} />
                <div className="flex gap-2">
                  <div className="h-6 flex-1 rounded-md" style={{ background: form.secondary_color }} />
                  <div className="h-6 flex-1 rounded-md bg-muted" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Thème : {THEMES.find((t) => t.key === form.theme)?.label}
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

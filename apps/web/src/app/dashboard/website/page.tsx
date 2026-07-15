"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink, Globe, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";

export default function WebsitePage() {
  const { me } = useAuth();
  const restaurant = me?.restaurant;
  const slug = restaurant?.slug;
  const customDomain = restaurant?.branding?.custom_domain ?? null;

  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read the public origin once on mount (client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const platformUrl = slug && origin ? `${origin}/site/${slug}` : "";
  const primaryUrl = customDomain ? `https://${customDomain}` : platformUrl;

  useEffect(() => {
    if (!primaryUrl) return;
    QRCode.toDataURL(primaryUrl, { width: 240, margin: 1, color: { dark: "#0a0a0b", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [primaryUrl]);

  const isActive = restaurant?.status === "active";

  async function copy() {
    await navigator.clipboard.writeText(primaryUrl);
    setCopied(true);
    toast("Lien copié.", "success");
    setTimeout(() => setCopied(false), 1500);
  }

  const previewKey = useMemo(() => platformUrl, [platformUrl]);

  if (!restaurant) {
    return (
      <div>
        <PageHeader title="Site web" description="Le site public de votre restaurant." />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site web"
        description="Votre restaurant possède son propre site public, prêt à partager."
        action={
          primaryUrl && (
            <Button asChild>
              <a href={primaryUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Visiter le site
              </a>
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Status + URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5 text-primary" /> Votre adresse
                {isActive ? (
                  <Badge variant="success">En ligne</Badge>
                ) : (
                  <Badge variant="warning">Hors ligne</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1.5 text-sm text-muted-foreground">Adresse Ndaw-Resto</p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                    {platformUrl || "…"}
                  </code>
                  <Button variant="outline" size="icon" onClick={copy} aria-label="Copier">
                    {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm text-muted-foreground">Domaine personnalisé</p>
                {customDomain ? (
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                      https://{customDomain}
                    </code>
                    <Badge variant="default">configuré</Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                    Aucun domaine personnalisé
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/dashboard/settings">Configurer</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Aperçu en direct</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-border">
                {previewKey ? (
                  <iframe
                    key={previewKey}
                    title="Aperçu du site"
                    src={previewKey}
                    className="h-[520px] w-full bg-background"
                  />
                ) : (
                  <Skeleton className="h-[520px] w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR + share */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="size-5 text-primary" /> QR code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR code du site" className="size-48 rounded-xl border border-border" />
              ) : (
                <Skeleton className="size-48" />
              )}
              <p className="text-center text-sm text-muted-foreground">
                À imprimer sur vos tables : vos clients scannent pour voir le menu et réserver.
              </p>
              {qr && (
                <Button asChild variant="outline" className="w-full">
                  <a href={qr} download={`qr-${slug}.png`}>
                    Télécharger le QR
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inclus dans votre offre</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {["Page à votre marque", "Menu en ligne", "Réservation intégrée", "Avis clients", "Domaine personnalisé"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-success" /> {f}
                    </li>
                  ),
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

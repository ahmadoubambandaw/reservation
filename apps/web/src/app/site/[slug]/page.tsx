"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, MapPin, Phone, Star, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { SitePayload } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { SiteBooking } from "./_site-booking";

const DAYS: [string, string][] = [
  ["mon", "Lundi"],
  ["tue", "Mardi"],
  ["wed", "Mercredi"],
  ["thu", "Jeudi"],
  ["fri", "Vendredi"],
  ["sat", "Samedi"],
  ["sun", "Dimanche"],
];

const SERVICE_LABEL: Record<string, string> = {
  dine_in: "Sur place",
  takeaway: "À emporter",
  delivery: "Livraison",
};

export default function RestaurantSite() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<SitePayload | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<SitePayload>(`/sites/${slug}`)
      .then(setSite)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      });
  }, [slug]);

  if (notFound) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Site introuvable</h1>
          <p className="mt-2 text-muted-foreground">Ce restaurant n&apos;a pas de site actif.</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  const r = site.restaurant;
  const brand = r.branding?.primary_color ?? "#4f46e5";
  const brand2 = r.branding?.secondary_color ?? "#f59e0b";
  const hasMap = r.location.lat != null && r.location.lng != null;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ ["--brand" as string]: brand, ["--brand2" as string]: brand2 }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            {r.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo} alt="" className="size-8 rounded-lg object-cover" />
            ) : (
              <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: brand }}>
                <UtensilsCrossed className="size-4" />
              </span>
            )}
            <span className="font-semibold tracking-tight">{r.name}</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#menu" className="hover:text-foreground">Menu</a>
            <a href="#avis" className="hover:text-foreground">Avis</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <a
            href="#reserver"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110"
            style={{ background: brand }}
          >
            Réserver
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative">
        <div className="relative h-[380px] sm:h-[460px]">
          {r.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.cover} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand}, ${brand2})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-4 pb-10 sm:px-6">
            {r.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo} alt="" className="mb-4 size-16 rounded-2xl object-cover ring-4 ring-white/20" />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{r.name}</h1>
              {site.rating.count > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  {site.rating.average} ({site.rating.count})
                </span>
              )}
            </div>
            {r.description && <p className="mt-3 max-w-2xl text-lg text-white/85">{r.description}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#reserver"
                className="rounded-xl px-6 py-3 font-medium text-white shadow-lg transition-all hover:brightness-110"
                style={{ background: brand }}
              >
                Réserver une table
              </a>
              <div className="flex flex-wrap gap-2">
                {(r.services ?? []).map((s) => (
                  <span key={s} className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur">
                    {SERVICE_LABEL[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6">
        <SectionTitle brand={brand2} kicker="Notre carte">Menu</SectionTitle>
        {site.menu.length === 0 ? (
          <p className="text-muted-foreground">Menu bientôt disponible.</p>
        ) : (
          <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {site.menu.map((cat) => (
              <div key={cat.id}>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold" style={{ color: brand }}>
                  {cat.name}
                </h3>
                <ul className="space-y-4">
                  {(cat.items ?? []).map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <span className="whitespace-nowrap font-medium">{formatMoney(item.price, r.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hours + location */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <SectionTitle brand={brand2} kicker="Nous rendre visite">Horaires</SectionTitle>
            <ul className="mt-6 divide-y divide-border">
              {DAYS.map(([key, label]) => {
                const slots = r.opening_hours?.[key];
                return (
                  <li key={key} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" /> {label}
                    </span>
                    <span className={slots?.length ? "font-medium" : "text-muted-foreground"}>
                      {slots?.length ? slots.map((s) => `${s.open} – ${s.close}`).join(", ") : "Fermé"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <SectionTitle brand={brand2} kicker="Adresse">Localisation</SectionTitle>
            <div className="mt-6 space-y-3">
              {r.address && (
                <p className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: brand }} />
                  {r.address}
                  {r.city ? `, ${r.city}` : ""}
                </p>
              )}
              <div className="overflow-hidden rounded-xl border border-border">
                {hasMap ? (
                  <iframe
                    title="Carte"
                    className="h-56 w-full"
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${r.location.lat},${r.location.lng}&z=15&output=embed`}
                  />
                ) : (
                  <div className="grid h-56 place-items-center bg-muted text-sm text-muted-foreground">
                    Localisation non renseignée
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {site.reviews.length > 0 && (
        <section id="avis" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionTitle brand={brand2} kicker="Ils ont aimé">Avis clients</SectionTitle>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {site.reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                    />
                  ))}
                </div>
                {rev.comment && <p className="mt-3 text-sm text-muted-foreground">“{rev.comment}”</p>}
                <p className="mt-3 text-sm font-medium">{rev.customer?.name ?? "Client"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking */}
      <section id="reserver" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionTitle brand={brand2} kicker="Réservation" center>
            Réservez votre table
          </SectionTitle>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <SiteBooking slug={r.slug} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <p className="text-lg font-semibold">{r.name}</p>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {r.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4" /> {r.phone}
                  </p>
                )}
                {r.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" /> {r.address}
                    {r.city ? `, ${r.city}` : ""}
                  </p>
                )}
                {r.email && <p>{r.email}</p>}
              </div>
            </div>
            <a
              href={r.slug ? "#reserver" : "#"}
              className="self-start rounded-xl px-6 py-3 font-medium text-white shadow-sm transition-all hover:brightness-110"
              style={{ background: brand }}
            >
              Réserver une table
            </a>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} {r.name}</span>
            <Link href="/" className="hover:text-foreground">
              Propulsé par <span className="font-medium text-foreground">Ndaw-Resto</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({
  children,
  kicker,
  brand,
  center,
}: {
  children: React.ReactNode;
  kicker: string;
  brand: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: brand }}>
        {kicker}
      </p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight">{children}</h2>
    </div>
  );
}

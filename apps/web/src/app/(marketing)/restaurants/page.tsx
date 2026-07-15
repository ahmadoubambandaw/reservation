"use client";

import Link from "next/link";
import { MapPin, Search, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Paginated, Restaurant } from "@/lib/types";

export default function RestaurantsPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const query = q ? `?q=${encodeURIComponent(q)}` : "";
      api
        .get<Paginated<Restaurant>>(`/restaurants${query}`)
        .then((r) => setItems(r.data))
        .catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Découvrez nos restaurants
        </h1>
        <p className="mt-3 text-muted-foreground">
          Trouvez un établissement et réservez votre table en quelques secondes.
        </p>
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom ou ville…"
            className="h-12 pl-10"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!items ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucun restaurant trouvé.
          </div>
        ) : (
          items.map((r) => (
            <Link key={r.id} href={`/site/${r.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15">
                  {r.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="size-10 text-primary/40" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{r.name}</h3>
                  {r.city && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {r.city}
                    </p>
                  )}
                  {r.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(r.services ?? []).slice(0, 3).map((s) => (
                      <Badge key={s} variant="neutral">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

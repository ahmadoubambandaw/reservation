"use client";

import { useParams } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import type { Category, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { BookingForm } from "./_booking-form";

export default function RestaurantDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Category[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ data: Restaurant }>(`/restaurants/${slug}`)
      .then((r) => setRestaurant(r.data))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      });
    api
      .get<{ data: Category[] }>(`/restaurants/${slug}/menu`)
      .then((r) => setMenu(r.data))
      .catch(() => setMenu([]));
  }, [slug]);

  async function book(payload: Record<string, unknown>) {
    try {
      await api.post(`/restaurants/${slug}/reservations`, payload);
      toast("Réservation envoyée ! Vous recevrez une confirmation.", "success");
      return true;
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
      return false;
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-32 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Restaurant introuvable</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent/20 sm:h-72">
        {restaurant?.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.cover} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-6 lg:flex-row">
          {/* Main */}
          <div className="flex-1">
            <Card className="p-6">
              {restaurant ? (
                <>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {restaurant.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {restaurant.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" /> {restaurant.address}
                        {restaurant.city ? `, ${restaurant.city}` : ""}
                      </span>
                    )}
                    {restaurant.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-4" /> {restaurant.phone}
                      </span>
                    )}
                  </div>
                  {restaurant.description && (
                    <p className="mt-4 text-muted-foreground">
                      {restaurant.description}
                    </p>
                  )}
                </>
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </Card>

            {/* Menu */}
            <h2 className="mt-10 text-2xl font-semibold tracking-tight">Menu</h2>
            <div className="mt-4 space-y-8">
              {!menu ? (
                <Skeleton className="h-64 w-full" />
              ) : menu.length === 0 ? (
                <p className="text-muted-foreground">Menu bientôt disponible.</p>
              ) : (
                menu.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat.name}
                    </h3>
                    <div className="space-y-2">
                      {(cat.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="whitespace-nowrap font-medium">
                            {formatMoney(item.price, restaurant?.currency ?? "XOF")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Booking */}
          <div className="w-full lg:w-96">
            <div className="lg:sticky lg:top-24">
              <BookingForm onSubmit={book} />
            </div>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}

"use client";

import {
  CalendarCheck,
  CreditCard,
  ShoppingBag,
  Table2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DashboardData } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function DashboardOverview() {
  const { me } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/dashboard")
      .then((r) => setData(r.data))
      .catch(() => setData(null));
  }, []);

  const currency = me?.restaurant?.currency ?? "XOF";
  const tables = data?.tables;

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${me?.user.name?.split(" ")[0] ?? ""}`}
        description="Voici l'activité de votre restaurant aujourd'hui."
      />

      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Revenus du jour"
              value={formatMoney(data.revenue_today, currency)}
              icon={CreditCard}
            />
            <StatCard label="Commandes" value={data.orders_today} icon={ShoppingBag} />
            <StatCard
              label="Réservations"
              value={data.reservations_today}
              icon={CalendarCheck}
            />
            <StatCard
              label="Tables occupées"
              value={`${tables?.occupied ?? 0} / ${tables?.total ?? 0}`}
              icon={Table2}
              hint={`${tables?.available ?? 0} disponibles`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Occupation des tables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Disponibles", tables?.available ?? 0, "bg-success"],
                  ["Occupées", tables?.occupied ?? 0, "bg-primary"],
                  ["Réservées", tables?.reserved ?? 0, "bg-accent"],
                ].map(([label, count, color]) => {
                  const total = tables?.total || 1;
                  const pct = (Number(count) / total) * 100;
                  return (
                    <div key={label as string}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commandes par statut</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(data.orders_by_status ?? {}).length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Aucune commande aujourd&apos;hui.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {Object.entries(data.orders_by_status).map(([status, count]) => (
                      <li
                        key={status}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
                      >
                        <span className="capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

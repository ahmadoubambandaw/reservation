"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BarChart } from "@/components/dashboard/bar-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  EmployeeReport,
  PopularDish,
  ReservationsReport,
  SalesReport,
} from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

const RANGES = [
  { key: "7", label: "7 jours" },
  { key: "30", label: "30 jours" },
  { key: "90", label: "90 jours" },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { me, hasModule, loading } = useAuth();
  const router = useRouter();
  const currency = me?.restaurant?.currency ?? "XOF";

  const [range, setRange] = useState("30");
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [dishes, setDishes] = useState<PopularDish[] | null>(null);
  const [reservations, setReservations] = useState<ReservationsReport | null>(null);
  const [employees, setEmployees] = useState<EmployeeReport[] | null>(null);

  useEffect(() => {
    if (!loading && !hasModule("reports")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    const qs = `?from=${isoDaysAgo(Number(range))}&to=${isoDaysAgo(0)}`;
    setSales(null);
    setDishes(null);
    setReservations(null);
    setEmployees(null);
    api.get<{ data: SalesReport }>(`/reports/sales${qs}`).then((r) => setSales(r.data)).catch(() => {});
    api.get<{ data: PopularDish[] }>(`/reports/popular-dishes${qs}`).then((r) => setDishes(r.data)).catch(() => setDishes([]));
    api.get<{ data: ReservationsReport }>(`/reports/reservations${qs}`).then((r) => setReservations(r.data)).catch(() => {});
    api.get<{ data: EmployeeReport[] }>(`/reports/employees${qs}`).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, [range]);

  // Reloads (and resets to skeletons) whenever the range changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  const typeLabels: Record<string, string> = {
    dine_in: "Sur place",
    takeaway: "À emporter",
    delivery: "Livraison",
  };

  return (
    <div>
      <PageHeader
        title="Rapports"
        description="Analysez vos ventes, réservations et performances."
        action={
          <div className="flex rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  range === r.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      {!sales ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Chiffre d'affaires" value={formatMoney(sales.total_revenue, currency)} icon={TrendingUp} />
          <StatCard label="Commandes" value={sales.orders_count} icon={ShoppingBag} />
          <StatCard label="Ticket moyen" value={formatMoney(sales.average_ticket, currency)} icon={Receipt} />
          <StatCard
            label="Réservations"
            value={reservations?.total ?? "—"}
            icon={CalendarCheck}
            hint={reservations ? `${reservations.covers} couverts` : undefined}
          />
        </div>
      )}

      {/* Revenue chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Évolution du chiffre d&apos;affaires</CardTitle>
        </CardHeader>
        <CardContent>
          {!sales ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <BarChart
              height={220}
              data={sales.by_day.map((d) => ({
                label: new Date(d.day).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
                value: d.revenue,
                title: `${new Date(d.day).toLocaleDateString("fr-FR")} · ${formatMoney(d.revenue, currency)}`,
              }))}
              format={(v) => formatMoney(v, currency)}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Popular dishes */}
        <Card>
          <CardHeader>
            <CardTitle>Plats les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            {!dishes ? (
              <Skeleton className="h-52 w-full" />
            ) : dishes.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aucune vente sur la période.</p>
            ) : (
              <ul className="space-y-2">
                {dishes.slice(0, 8).map((d, i) => (
                  <li key={d.name} className="flex items-center gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{d.name}</span>
                    <span className="text-sm text-muted-foreground">×{d.quantity}</span>
                    <span className="w-24 text-right text-sm font-medium">
                      {formatMoney(d.revenue, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Sales by type + employees */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventes par type</CardTitle>
            </CardHeader>
            <CardContent>
              {!sales ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <ul className="space-y-2">
                  {sales.by_type.map((t) => (
                    <li key={t.type} className="flex items-center justify-between text-sm">
                      <span>{typeLabels[t.type] ?? t.type}</span>
                      <span className="text-muted-foreground">
                        {t.count} · <span className="font-medium text-foreground">{formatMoney(t.revenue, currency)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance des employés</CardTitle>
            </CardHeader>
            <CardContent>
              {!employees ? (
                <Skeleton className="h-24 w-full" />
              ) : employees.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucune donnée.</p>
              ) : (
                <ul className="space-y-2">
                  {employees.map((e, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{e.employee ?? "—"}</span>
                      <span className="text-muted-foreground">
                        {e.orders} cmd · <span className="font-medium text-foreground">{formatMoney(e.revenue, currency)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

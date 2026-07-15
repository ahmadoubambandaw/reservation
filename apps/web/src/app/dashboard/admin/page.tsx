"use client";

import { Building2, Receipt, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";

interface AdminStats {
  restaurants: { total: number; active: number; suspended: number };
  users: number;
  subscriptions_by_status: Record<string, number>;
  mrr: number;
  revenue_collected: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<{ data: AdminStats }>("/admin/stats").then((r) => setStats(r.data)).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <PageHeader
        title="Super Admin"
        description="Vue d'ensemble de la plateforme Ndaw-Resto."
      />

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Restaurants"
              value={stats.restaurants.total}
              icon={Building2}
              hint={`${stats.restaurants.active} actifs`}
            />
            <StatCard label="Utilisateurs" value={stats.users} icon={Users} />
            <StatCard label="MRR" value={formatMoney(stats.mrr)} icon={TrendingUp} />
            <StatCard
              label="Revenus encaissés"
              value={formatMoney(stats.revenue_collected)}
              icon={Receipt}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Abonnements par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {Object.entries(stats.subscriptions_by_status).map(([status, count]) => (
                  <li
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
                  >
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

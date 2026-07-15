"use client";

import { useRouter } from "next/navigation";
import { Check, ChefHat, Clock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { KitchenItem, KitchenOrder, KitchenQueue } from "@/lib/types";
import { cn } from "@/lib/utils";

const ITEM_NEXT: Record<string, KitchenItem["status"]> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
};

const ITEM_STYLE: Record<string, string> = {
  pending: "border-border bg-muted text-muted-foreground",
  preparing: "border-warning/40 bg-warning/10 text-warning",
  ready: "border-success/40 bg-success/10 text-success",
  served: "border-border bg-transparent text-muted-foreground line-through",
};

function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export default function KitchenPage() {
  const { hasModule, loading } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<KitchenQueue | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const busyRef = useRef(false);

  useEffect(() => {
    if (!loading && !hasModule("kitchen_display")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(async () => {
    try {
      const data = await api.get<KitchenQueue>("/kitchen/queue");
      setQueue(data);
    } catch {
      setQueue({ data: [], summary: { pending: 0, preparing: 0, ready: 0 } });
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Live board: initial fetch + poll every 6s.
    void load();
    const id = setInterval(() => {
      setNow(Date.now());
      if (!busyRef.current) void load();
    }, 6000);
    return () => clearInterval(id);
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function advanceItem(item: KitchenItem) {
    const next = ITEM_NEXT[item.status];
    if (!next) return;
    busyRef.current = true;
    try {
      await api.patch(`/kitchen/items/${item.id}`, { status: next });
      await load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Erreur", "error");
    } finally {
      busyRef.current = false;
    }
  }

  async function bump(order: KitchenOrder) {
    busyRef.current = true;
    try {
      await api.post(`/kitchen/orders/${order.code}/bump`);
      await load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Erreur", "error");
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div>
      <PageHeader
        title="Écran cuisine"
        description="File des commandes en temps réel. Touchez un plat pour faire avancer sa préparation."
        action={
          queue && (
            <div className="flex gap-2">
              <Badge variant="neutral">{queue.summary.pending} en attente</Badge>
              <Badge variant="warning">{queue.summary.preparing} en préparation</Badge>
              <Badge variant="success">{queue.summary.ready} prêts</Badge>
            </div>
          )
        }
      />

      {!queue ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : queue.data.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
            <Check className="size-7" />
          </span>
          <p className="font-medium">Aucune commande en attente</p>
          <p className="text-sm text-muted-foreground">La cuisine est à jour. 🎉</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {queue.data.map((order) => {
            const mins = minutesSince(order.created_at, now);
            const urgent = mins >= 15;
            return (
              <Card
                key={order.id}
                className={cn(
                  "flex flex-col overflow-hidden",
                  urgent && "border-danger/50 ring-1 ring-danger/20",
                )}
              >
                <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                  <div>
                    <p className="font-semibold">{order.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.table?.name ?? order.type}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      urgent ? "text-danger" : "text-muted-foreground",
                    )}
                  >
                    <Clock className="size-3.5" /> {mins} min
                  </span>
                </div>

                <div className="flex-1 space-y-2 p-4">
                  {order.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => advanceItem(item)}
                      disabled={item.status === "served"}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        ITEM_STYLE[item.status],
                      )}
                    >
                      <span>
                        <span className="font-semibold">{item.quantity}×</span> {item.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-wide">{item.status}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-border p-3">
                  <Button size="sm" className="w-full" onClick={() => bump(order)}>
                    <ChefHat className="size-4" />
                    {order.status === "pending" ? "Démarrer" : "Marquer servi"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Lock,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  Unlock,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  CashSession,
  Category,
  MenuItem,
  Order,
  Paginated,
  Ticket,
} from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

type OrderType = "dine_in" | "takeaway" | "delivery";
const METHODS = [
  { key: "cash", label: "Espèces" },
  { key: "wave", label: "Wave" },
  { key: "orange_money", label: "Orange Money" },
  { key: "manual", label: "Carte / autre" },
];

export default function PosPage() {
  const { me, hasModule, loading } = useAuth();
  const router = useRouter();
  const currency = me?.restaurant?.currency ?? "XOF";

  const [session, setSession] = useState<CashSession | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cat, setCat] = useState<number | "all">("all");
  const [cart, setCart] = useState<Record<number, { item: MenuItem; qty: number }>>({});
  const [type, setType] = useState<OrderType>("dine_in");

  const [openFloat, setOpenFloat] = useState("");
  const [closeOpen, setCloseOpen] = useState(false);
  const [counted, setCounted] = useState("");
  const [pay, setPay] = useState<{ mode: "cart" } | { mode: "order"; order: Order } | null>(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [payAmount, setPayAmount] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !hasModule("pos")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const loadSession = useCallback(() => {
    api.get<{ data: CashSession | null }>("/pos/sessions/current").then((r) => setSession(r.data));
  }, []);
  const loadOrders = useCallback(() => {
    api.get<Paginated<Order>>("/orders?per_page=12").then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    loadSession();
    loadOrders();
    api.get<{ data: Category[] }>("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get<Paginated<MenuItem>>("/menu-items?per_page=100&available_only=1").then((r) => setItems(r.data)).catch(() => {});
  }, [loadSession, loadOrders]);

  const visibleItems = useMemo(
    () => (cat === "all" ? items : items.filter((i) => i.category_id === cat)),
    [items, cat],
  );
  const cartLines = Object.values(cart);
  const cartTotal = cartLines.reduce((s, l) => s + l.item.price * l.qty, 0);

  function addToCart(item: MenuItem) {
    setCart((c) => ({ ...c, [item.id]: { item, qty: (c[item.id]?.qty ?? 0) + 1 } }));
  }
  function step(id: number, delta: number) {
    setCart((c) => {
      const qty = (c[id]?.qty ?? 0) + delta;
      if (qty <= 0) {
        const rest = { ...c };
        delete rest[id];
        return rest;
      }
      return { ...c, [id]: { item: c[id].item, qty } };
    });
  }

  async function openRegister() {
    setBusy(true);
    try {
      await api.post("/pos/sessions", { opening_float: Number(openFloat) || 0 });
      toast("Caisse ouverte.", "success");
      setOpenFloat("");
      loadSession();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function closeRegister() {
    if (!session) return;
    setBusy(true);
    try {
      await api.post(`/pos/sessions/${session.id}/close`, { counted_amount: Number(counted) || 0 });
      toast("Caisse clôturée.", "success");
      setCloseOpen(false);
      setCounted("");
      loadSession();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  function startCheckout() {
    if (cartLines.length === 0) return;
    setPay({ mode: "cart" });
    setPayMethod("cash");
    setPayAmount(String(cartTotal));
  }
  function startPayExisting(order: Order) {
    setPay({ mode: "order", order });
    setPayMethod("cash");
    setPayAmount(String(order.total));
  }

  async function confirmPayment() {
    if (!pay) return;
    setBusy(true);
    try {
      let code: string;
      if (pay.mode === "cart") {
        const created = await api.post<{ data: Order }>("/orders", {
          type,
          items: cartLines.map((l) => ({ menu_item_id: l.item.id, quantity: l.qty })),
        });
        code = created.data.code;
      } else {
        code = pay.order.code;
      }
      await api.post(`/orders/${code}/payments`, {
        amount: Number(payAmount),
        method: payMethod,
      });
      toast("Paiement enregistré.", "success");
      setPay(null);
      setCart({});
      loadOrders();
      loadSession();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function showTicket(order: Order) {
    try {
      const r = await api.get<{ data: Ticket }>(`/orders/${order.code}/ticket`);
      setTicket(r.data);
    } catch {
      toast("Ticket indisponible.", "error");
    }
  }

  if (session === undefined) {
    return (
      <div>
        <PageHeader title="Point de vente" description="Encaissement et caisse." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <PageHeader title="Point de vente" description="Ouvrez la caisse pour commencer à encaisser." />
        <Card className="mx-auto max-w-md p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Unlock className="size-7" />
          </span>
          <h3 className="mt-4 font-semibold">Caisse fermée</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez le fond de caisse initial pour ouvrir une session.
          </p>
          <div className="mt-5 space-y-3 text-left">
            <Label htmlFor="float">Fond de caisse</Label>
            <Input
              id="float"
              type="number"
              min={0}
              value={openFloat}
              onChange={(e) => setOpenFloat(e.target.value)}
              placeholder="0"
            />
            <Button className="w-full" onClick={openRegister} disabled={busy}>
              {busy ? "Ouverture…" : "Ouvrir la caisse"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Point de vente"
        description="Composez la commande, encaissez, imprimez le ticket."
        action={
          <Button variant="outline" onClick={() => setCloseOpen(true)}>
            <Lock className="size-4" /> Clôturer la caisse
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Catalog */}
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <CatButton active={cat === "all"} onClick={() => setCat("all")}>
              Tout
            </CatButton>
            {categories.map((c) => (
              <CatButton key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                {c.name}
              </CatButton>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <span className="font-medium leading-tight">{item.name}</span>
                <span className="mt-3 text-sm text-primary">
                  {formatMoney(item.price, currency)}
                </span>
              </button>
            ))}
            {visibleItems.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                Aucun plat disponible.
              </p>
            )}
          </div>

          {/* Recent orders */}
          <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Commandes récentes
          </h3>
          <Card className="divide-y divide-border">
            {orders.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Aucune commande.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {o.code} <span className="text-xs text-muted-foreground">· {o.type}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{formatMoney(o.total, currency)}</p>
                  </div>
                  <Badge variant={o.payment_status === "paid" ? "success" : "warning"}>
                    {o.payment_status}
                  </Badge>
                  {o.payment_status !== "paid" && (
                    <Button size="sm" onClick={() => startPayExisting(o)}>
                      Payer
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => showTicket(o)}>
                    <Receipt className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Cart */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              <h3 className="font-semibold">Ticket en cours</h3>
            </div>

            <div className="mb-4 flex gap-1.5">
              {(["dine_in", "takeaway", "delivery"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors",
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t === "dine_in" ? "Sur place" : t === "takeaway" ? "À emporter" : "Livraison"}
                </button>
              ))}
            </div>

            {cartLines.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Ajoutez des plats depuis le catalogue.
              </p>
            ) : (
              <div className="space-y-2">
                {cartLines.map(({ item, qty }) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(item.price, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="size-7" onClick={() => step(item.id, -1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{qty}</span>
                      <Button size="icon" variant="outline" className="size-7" onClick={() => step(item.id, 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold">{formatMoney(cartTotal, currency)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCart({})} disabled={cartLines.length === 0}>
                  <Trash2 className="size-4" />
                </Button>
                <Button className="flex-1" onClick={startCheckout} disabled={cartLines.length === 0}>
                  Encaisser
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog open={!!pay} onClose={() => setPay(null)} title="Encaissement">
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Montant à payer</p>
            <p className="text-2xl font-semibold">
              {formatMoney(pay?.mode === "order" ? pay.order.total : cartTotal, currency)}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Mode de paiement</Label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setPayMethod(m.key)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                    payMethod === m.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amt">Montant reçu</Label>
            <Input id="amt" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </div>
          <Button className="w-full" onClick={confirmPayment} disabled={busy}>
            {busy ? "Traitement…" : "Valider le paiement"}
          </Button>
        </div>
      </Dialog>

      {/* Close register dialog */}
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} title="Clôturer la caisse">
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fond initial</span>
              <span>{formatMoney(session.opening_float, currency)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnt">Montant compté en caisse</Label>
            <Input id="cnt" type="number" value={counted} onChange={(e) => setCounted(e.target.value)} />
          </div>
          <Button className="w-full" onClick={closeRegister} disabled={busy}>
            {busy ? "Clôture…" : "Clôturer"}
          </Button>
        </div>
      </Dialog>

      {/* Ticket dialog */}
      <Dialog open={!!ticket} onClose={() => setTicket(null)} title="Ticket">
        {ticket && (
          <div className="space-y-3 font-mono text-sm">
            <div className="text-center">
              <p className="font-semibold">{ticket.restaurant.name}</p>
              {ticket.restaurant.address && (
                <p className="text-xs text-muted-foreground">{ticket.restaurant.address}</p>
              )}
              <p className="text-xs text-muted-foreground">{ticket.code}</p>
            </div>
            <div className="border-y border-dashed border-border py-2">
              {ticket.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {it.quantity}× {it.name}
                  </span>
                  <span>{formatMoney(it.total, ticket.currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold">
              <span>TOTAL</span>
              <span>{formatMoney(ticket.total, ticket.currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payé</span>
              <span>{formatMoney(ticket.paid, ticket.currency)}</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              Imprimer
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function CatButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

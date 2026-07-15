"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import type { Ingredient, Purchase, Supplier } from "@/lib/types";
import { cn, formatDate, formatMoney } from "@/lib/utils";

type Tab = "ingredients" | "suppliers" | "purchases";

export default function InventoryPage() {
  const { me, hasModule, loading } = useAuth();
  const router = useRouter();
  const currency = me?.restaurant?.currency ?? "XOF";

  const [tab, setTab] = useState<Tab>("ingredients");
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);

  const [addIng, setAddIng] = useState(false);
  const [addSup, setAddSup] = useState(false);
  const [addPur, setAddPur] = useState(false);
  const [adjust, setAdjust] = useState<Ingredient | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !hasModule("inventory")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    api.get<{ data: Ingredient[] }>("/ingredients").then((r) => setIngredients(r.data)).catch(() => setIngredients([]));
    api.get<{ data: Supplier[] }>("/suppliers").then((r) => setSuppliers(r.data)).catch(() => setSuppliers([]));
    api.get<{ data: Purchase[] }>("/purchases").then((r) => setPurchases(r.data)).catch(() => setPurchases([]));
  }, []);

  useEffect(load, [load]);

  // API serialises decimals as strings — coerce before comparing.
  const lowCount = (ingredients ?? []).filter(
    (i) => Number(i.stock_quantity) <= Number(i.reorder_level),
  ).length;

  return (
    <div>
      <PageHeader
        title="Stocks"
        description="Ingrédients, fournisseurs, achats et alertes de réapprovisionnement."
        action={
          <Button
            onClick={() =>
              tab === "ingredients" ? setAddIng(true) : tab === "suppliers" ? setAddSup(true) : setAddPur(true)
            }
          >
            <Plus className="size-4" />
            {tab === "ingredients" ? "Ingrédient" : tab === "suppliers" ? "Fournisseur" : "Achat"}
          </Button>
        }
      />

      {lowCount > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <TriangleAlert className="size-5 shrink-0" />
          {lowCount} ingrédient(s) sous le seuil de réapprovisionnement.
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border border-border p-0.5">
        {(
          [
            ["ingredients", "Ingrédients"],
            ["suppliers", "Fournisseurs"],
            ["purchases", "Achats"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
              tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ingredients" && (
        <IngredientsTab
          ingredients={ingredients}
          currency={currency}
          onAdjust={setAdjust}
        />
      )}
      {tab === "suppliers" && <SuppliersTab suppliers={suppliers} />}
      {tab === "purchases" && (
        <PurchasesTab purchases={purchases} currency={currency} onReceive={receivePurchase} />
      )}

      {/* Add ingredient */}
      <Dialog open={addIng} onClose={() => setAddIng(false)} title="Nouvel ingrédient">
        <IngredientForm suppliers={suppliers ?? []} busy={busy} onSubmit={createIngredient} />
      </Dialog>

      {/* Add supplier */}
      <Dialog open={addSup} onClose={() => setAddSup(false)} title="Nouveau fournisseur">
        <SupplierForm busy={busy} onSubmit={createSupplier} />
      </Dialog>

      {/* New purchase */}
      <Dialog open={addPur} onClose={() => setAddPur(false)} title="Nouvel achat">
        <PurchaseForm
          suppliers={suppliers ?? []}
          ingredients={ingredients ?? []}
          busy={busy}
          onSubmit={createPurchase}
        />
      </Dialog>

      {/* Adjust stock */}
      <Dialog open={!!adjust} onClose={() => setAdjust(null)} title={`Ajuster : ${adjust?.name ?? ""}`}>
        {adjust && <AdjustForm ingredient={adjust} busy={busy} onSubmit={submitAdjust} />}
      </Dialog>
    </div>
  );

  async function createIngredient(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await api.post("/ingredients", payload);
      toast("Ingrédient ajouté.", "success");
      setAddIng(false);
      load();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function createSupplier(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await api.post("/suppliers", payload);
      toast("Fournisseur ajouté.", "success");
      setAddSup(false);
      load();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function createPurchase(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await api.post("/purchases", payload);
      toast("Achat enregistré.", "success");
      setAddPur(false);
      load();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function receivePurchase(p: Purchase) {
    try {
      await api.post(`/purchases/${p.id}/receive`);
      toast("Achat réceptionné, stock mis à jour.", "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Erreur", "error");
    }
  }

  async function submitAdjust(payload: Record<string, unknown>) {
    if (!adjust) return;
    setBusy(true);
    try {
      await api.post(`/ingredients/${adjust.id}/adjust`, payload);
      toast("Stock ajusté.", "success");
      setAdjust(null);
      load();
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }
}

/* ------------------------------------------------------------------ */

function IngredientsTab({
  ingredients,
  currency,
  onAdjust,
}: {
  ingredients: Ingredient[] | null;
  currency: string;
  onAdjust: (i: Ingredient) => void;
}) {
  if (!ingredients) return <Skeleton className="h-64 w-full" />;
  if (ingredients.length === 0)
    return <Card className="p-16 text-center text-muted-foreground">Aucun ingrédient enregistré.</Card>;

  return (
    <Card className="divide-y divide-border">
      {ingredients.map((ing) => {
        const low = Number(ing.stock_quantity) <= Number(ing.reorder_level);
        return (
          <div key={ing.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                {ing.name}
                {low && (
                  <Badge variant="danger">
                    <AlertTriangle className="size-3" /> stock bas
                  </Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Seuil : {ing.reorder_level} {ing.unit} · {formatMoney(ing.cost_per_unit, currency)}/{ing.unit}
                {ing.supplier ? ` · ${ing.supplier.name}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-lg font-semibold", low && "text-danger")}>
                {Number(ing.stock_quantity)} {ing.unit}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onAdjust(ing)}>
              Ajuster
            </Button>
          </div>
        );
      })}
    </Card>
  );
}

function SuppliersTab({ suppliers }: { suppliers: Supplier[] | null }) {
  if (!suppliers) return <Skeleton className="h-64 w-full" />;
  if (suppliers.length === 0)
    return <Card className="p-16 text-center text-muted-foreground">Aucun fournisseur.</Card>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((s) => (
        <Card key={s.id} className="p-5">
          <p className="font-medium">{s.name}</p>
          {s.contact_name && <p className="text-sm text-muted-foreground">{s.contact_name}</p>}
          <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
            {s.phone && <p>{s.phone}</p>}
            {s.email && <p>{s.email}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function PurchasesTab({
  purchases,
  currency,
  onReceive,
}: {
  purchases: Purchase[] | null;
  currency: string;
  onReceive: (p: Purchase) => void;
}) {
  if (!purchases) return <Skeleton className="h-64 w-full" />;
  if (purchases.length === 0)
    return <Card className="p-16 text-center text-muted-foreground">Aucun achat enregistré.</Card>;

  return (
    <Card className="divide-y divide-border">
      {purchases.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{p.reference ?? `Achat #${p.id}`}</p>
            <p className="text-sm text-muted-foreground">
              {p.supplier?.name ?? "—"}
              {p.purchased_at ? ` · ${formatDate(p.purchased_at)}` : ""} · {p.items?.length ?? 0} ligne(s)
            </p>
          </div>
          <span className="font-medium">{formatMoney(p.total, currency)}</span>
          <Badge variant={p.status === "received" ? "success" : "warning"}>{p.status}</Badge>
          {p.status !== "received" && (
            <Button size="sm" onClick={() => onReceive(p)}>
              Réceptionner
            </Button>
          )}
        </div>
      ))}
    </Card>
  );
}

/* ------- Forms ------- */

function IngredientForm({
  suppliers,
  busy,
  onSubmit,
}: {
  suppliers: Supplier[];
  busy: boolean;
  onSubmit: (p: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({ name: "", unit: "kg", stock_quantity: 0, reorder_level: 0, cost_per_unit: 0, supplier_id: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...f, supplier_id: f.supplier_id ? Number(f.supplier_id) : null });
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Nom</Label>
        <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Unité</Label>
          <Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Coût / unité</Label>
          <Input type="number" min={0} value={f.cost_per_unit} onChange={(e) => setF({ ...f, cost_per_unit: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Stock actuel</Label>
          <Input type="number" min={0} value={f.stock_quantity} onChange={(e) => setF({ ...f, stock_quantity: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Seuil d&apos;alerte</Label>
          <Input type="number" min={0} value={f.reorder_level} onChange={(e) => setF({ ...f, reorder_level: Number(e.target.value) })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Fournisseur</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={f.supplier_id}
          onChange={(e) => setF({ ...f, supplier_id: e.target.value })}
        >
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

function SupplierForm({ busy, onSubmit }: { busy: boolean; onSubmit: (p: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ name: "", contact_name: "", phone: "", email: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(f);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Nom</Label>
        <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Contact</Label>
        <Input value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

function AdjustForm({
  ingredient,
  busy,
  onSubmit,
}: {
  ingredient: Ingredient;
  busy: boolean;
  onSubmit: (p: Record<string, unknown>) => void;
}) {
  const [type, setType] = useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type, quantity, reason });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        Stock actuel : {Number(ingredient.stock_quantity)} {ingredient.unit}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["in", "Entrée"],
            ["out", "Sortie"],
            ["adjustment", "Correction"],
          ] as ["in" | "out" | "adjustment", string][]
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setType(k)}
            className={cn(
              "rounded-lg border px-2 py-2 text-sm transition-colors",
              type === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>Quantité ({ingredient.unit})</Label>
        <Input type="number" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <div className="space-y-1.5">
        <Label>Motif</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Réception, perte, inventaire…" />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Enregistrement…" : "Appliquer"}
      </Button>
    </form>
  );
}

function PurchaseForm({
  suppliers,
  ingredients,
  busy,
  onSubmit,
}: {
  suppliers: Supplier[];
  ingredients: Ingredient[];
  busy: boolean;
  onSubmit: (p: Record<string, unknown>) => void;
}) {
  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState<{ ingredient_id: string; quantity: number; unit_cost: number }[]>([
    { ingredient_id: "", quantity: 1, unit_cost: 0 },
  ]);

  function setLine(i: number, patch: Partial<(typeof lines)[number]>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          supplier_id: supplierId ? Number(supplierId) : null,
          items: lines
            .filter((l) => l.ingredient_id)
            .map((l) => ({ ingredient_id: Number(l.ingredient_id), quantity: l.quantity, unit_cost: l.unit_cost })),
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Fournisseur</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Lignes d&apos;achat</Label>
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              className="h-9 flex-1 rounded-lg border border-input bg-background px-2 text-sm"
              value={l.ingredient_id}
              onChange={(e) => setLine(i, { ingredient_id: e.target.value })}
            >
              <option value="">Ingrédient…</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={0}
              className="h-9 w-16"
              value={l.quantity}
              onChange={(e) => setLine(i, { quantity: Number(e.target.value) })}
              title="Quantité"
            />
            <Input
              type="number"
              min={0}
              className="h-9 w-20"
              value={l.unit_cost}
              onChange={(e) => setLine(i, { unit_cost: Number(e.target.value) })}
              title="Coût unitaire"
            />
            {lines.length > 1 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9"
                onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLines((ls) => [...ls, { ingredient_id: "", quantity: 1, unit_cost: 0 }])}
        >
          <Plus className="size-4" /> Ajouter une ligne
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer l'achat"}
      </Button>
    </form>
  );
}

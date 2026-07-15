"use client";

import { useRouter } from "next/navigation";
import { Plus, Receipt, TrendingDown, TrendingUp, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AccountingSummary, Expense, Paginated } from "@/lib/types";
import { cn, formatDate, formatMoney } from "@/lib/utils";

const CATEGORIES = ["rent", "salaries", "supplies", "utilities", "marketing", "other"];
const CATEGORY_LABEL: Record<string, string> = {
  rent: "Loyer",
  salaries: "Salaires",
  supplies: "Fournitures",
  utilities: "Charges",
  marketing: "Marketing",
  other: "Autre",
};

function rangeDates(key: string) {
  const to = new Date();
  const from = new Date();
  if (key === "month") from.setDate(1);
  else from.setDate(from.getDate() - Number(key));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function AccountingPage() {
  const { me, hasModule, loading } = useAuth();
  const router = useRouter();
  const currency = me?.restaurant?.currency ?? "XOF";

  const [range, setRange] = useState("month");
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    category: "supplies",
    description: "",
    amount: 0,
    spent_at: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!loading && !hasModule("accounting")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    const { from, to } = rangeDates(range);
    api.get<{ data: AccountingSummary }>(`/accounting/summary?from=${from}&to=${to}`).then((r) => setSummary(r.data)).catch(() => {});
    api.get<Paginated<Expense>>("/expenses").then((r) => setExpenses(r.data)).catch(() => setExpenses([]));
  }, [range]);

  useEffect(load, [load]);

  async function createExpense(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/expenses", form);
      toast("Dépense enregistrée.", "success");
      setOpen(false);
      setForm({ category: "supplies", description: "", amount: 0, spent_at: new Date().toISOString().slice(0, 10) });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function removeExpense(id: number) {
    try {
      await api.delete(`/expenses/${id}`);
      load();
    } catch {
      toast("Suppression impossible.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Comptabilité"
        description="Revenus, dépenses et bénéfices de votre restaurant."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              {[
                ["month", "Ce mois"],
                ["30", "30 j"],
                ["90", "90 j"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    range === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Dépense
            </Button>
          </div>
        }
      />

      {!summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenus" value={formatMoney(summary.revenue, currency)} icon={TrendingUp} />
          <StatCard label="Dépenses" value={formatMoney(summary.expenses, currency)} icon={TrendingDown} />
          <StatCard label="Bénéfice" value={formatMoney(summary.profit, currency)} icon={Wallet} hint={`Marge ${summary.margin}%`} />
          <StatCard label="Ticket / dépenses" value={`${summary.margin}%`} icon={Receipt} hint="marge nette" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {!summary ? (
              <Skeleton className="h-40 w-full" />
            ) : summary.expenses_by_category.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune dépense sur la période.</p>
            ) : (
              <ul className="space-y-3">
                {summary.expenses_by_category.map((c) => {
                  const pct = summary.expenses > 0 ? (c.total / summary.expenses) * 100 : 0;
                  return (
                    <li key={c.category}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{CATEGORY_LABEL[c.category] ?? c.category}</span>
                        <span className="text-muted-foreground">{formatMoney(c.total, currency)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dépenses récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!expenses ? (
              <Skeleton className="m-6 h-40" />
            ) : expenses.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aucune dépense.</p>
            ) : (
              <ul className="divide-y divide-border">
                {expenses.map((ex) => (
                  <li key={ex.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {CATEGORY_LABEL[ex.category] ?? ex.category}
                        {ex.description ? ` · ${ex.description}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(ex.spent_at)}</p>
                    </div>
                    <span className="text-sm font-medium">{formatMoney(ex.amount, currency)}</span>
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => removeExpense(ex.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Nouvelle dépense">
        <form onSubmit={createExpense} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Montant</Label>
              <Input type="number" min={0} required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" required value={form.spent_at} onChange={(e) => setForm({ ...form, spent_at: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

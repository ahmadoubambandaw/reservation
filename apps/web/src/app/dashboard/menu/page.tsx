"use client";

import { Plus } from "lucide-react";
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
import type { Category, MenuItem, Paginated } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function MenuPage() {
  const { me } = useAuth();
  const currency = me?.restaurant?.currency ?? "XOF";
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [openItem, setOpenItem] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", price: 0, category_id: "" });
  const [catName, setCatName] = useState("");

  const load = useCallback(() => {
    api.get<{ data: Category[] }>("/categories").then((r) => setCategories(r.data)).catch(() => setCategories([]));
    api.get<Paginated<MenuItem>>("/menu-items?per_page=100").then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/menu-items", {
        name: itemForm.name,
        price: itemForm.price,
        category_id: itemForm.category_id ? Number(itemForm.category_id) : null,
      });
      toast("Plat ajouté.", "success");
      setOpenItem(false);
      setItemForm({ name: "", price: 0, category_id: "" });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  }

  async function createCat(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/categories", { name: catName });
      toast("Catégorie ajoutée.", "success");
      setOpenCat(false);
      setCatName("");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  }

  const loading = !categories || !items;

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Composez votre carte : catégories, plats, boissons et prix."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenCat(true)}>
              <Plus className="size-4" /> Catégorie
            </Button>
            <Button onClick={() => setOpenItem(true)}>
              <Plus className="size-4" /> Plat
            </Button>
          </div>
        }
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground">
          Votre carte est vide. Ajoutez une catégorie puis vos premiers plats.
        </Card>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catItems = items.filter((it) => it.category_id === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {cat.name}
                  </h3>
                  <Badge variant="neutral">{catItems.length}</Badge>
                </div>
                <Card className="divide-y divide-border">
                  {catItems.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="font-medium">{it.name}</p>
                        {it.description && (
                          <p className="text-sm text-muted-foreground">{it.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {!it.is_available && <Badge variant="danger">Indisponible</Badge>}
                        <span className="font-medium">{formatMoney(it.price, currency)}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={openItem} onClose={() => setOpenItem(false)} title="Nouveau plat">
        <form onSubmit={createItem} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="in">Nom</Label>
            <Input id="in" required value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ip">Prix</Label>
              <Input id="ip" type="number" min={0} required value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ic">Catégorie</Label>
              <select
                id="ic"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={itemForm.category_id}
                onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
              >
                <option value="">—</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Ajout…" : "Ajouter le plat"}
          </Button>
        </form>
      </Dialog>

      <Dialog open={openCat} onClose={() => setOpenCat(false)} title="Nouvelle catégorie">
        <form onSubmit={createCat} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cn">Nom de la catégorie</Label>
            <Input id="cn" required value={catName} onChange={(e) => setCatName(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Ajout…" : "Ajouter"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

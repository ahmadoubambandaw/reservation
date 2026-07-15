"use client";

import { useRouter } from "next/navigation";
import { Clock, LogIn, LogOut, Plus, Trash2 } from "lucide-react";
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
import type { Attendance, EmployeeSummary, Paginated, Shift } from "@/lib/types";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

type Tab = "shifts" | "attendance";

export default function StaffPage() {
  const { hasModule, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("shifts");
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [attendance, setAttendance] = useState<Attendance[] | null>(null);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ employee_id: "", starts_at: "", ends_at: "", role_label: "" });

  useEffect(() => {
    if (!loading && !hasModule("staff")) router.replace("/dashboard");
  }, [loading, hasModule, router]);

  const load = useCallback(() => {
    api.get<{ data: Shift[] }>("/shifts").then((r) => setShifts(r.data)).catch(() => setShifts([]));
    api.get<Paginated<Attendance>>("/attendances").then((r) => setAttendance(r.data)).catch(() => setAttendance([]));
    api.get<{ data: EmployeeSummary[] }>("/employees").then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function createShift(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/shifts", { ...form, employee_id: Number(form.employee_id) });
      toast("Créneau ajouté.", "success");
      setOpen(false);
      setForm({ employee_id: "", starts_at: "", ends_at: "", role_label: "" });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? (err.firstError ?? err.message) : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function removeShift(id: number) {
    try {
      await api.delete(`/shifts/${id}`);
      load();
    } catch {
      toast("Suppression impossible.", "error");
    }
  }

  async function clock(action: "in" | "out") {
    try {
      await api.post(`/attendances/clock-${action}`);
      toast(action === "in" ? "Pointage d'entrée enregistré." : "Pointage de sortie enregistré.", "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Erreur", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Personnel"
        description="Planning des équipes et suivi de présence."
        action={
          tab === "shifts" ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Créneau
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => clock("in")}>
                <LogIn className="size-4" /> Pointer entrée
              </Button>
              <Button onClick={() => clock("out")}>
                <LogOut className="size-4" /> Pointer sortie
              </Button>
            </div>
          )
        }
      />

      <div className="mb-5 flex gap-1 rounded-lg border border-border p-0.5">
        {(
          [
            ["shifts", "Planning"],
            ["attendance", "Présence"],
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

      {tab === "shifts" &&
        (!shifts ? (
          <Skeleton className="h-64 w-full" />
        ) : shifts.length === 0 ? (
          <Card className="p-16 text-center text-muted-foreground">Aucun créneau planifié.</Card>
        ) : (
          <Card className="divide-y divide-border">
            {shifts.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {(s.employee?.user?.name ?? "?").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.employee?.user?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(s.starts_at)} → {formatDateTime(s.ends_at)}
                    {s.role_label ? ` · ${s.role_label}` : ""}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => removeShift(s.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </Card>
        ))}

      {tab === "attendance" &&
        (!attendance ? (
          <Skeleton className="h-64 w-full" />
        ) : attendance.length === 0 ? (
          <Card className="p-16 text-center text-muted-foreground">Aucun pointage enregistré.</Card>
        ) : (
          <Card className="divide-y divide-border">
            {attendance.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                <Clock className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.employee?.user?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(a.work_date)}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {a.clock_in ? new Date(a.clock_in).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  {" → "}
                  {a.clock_out ? new Date(a.clock_out).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "…"}
                </div>
                <Badge variant={a.clock_out ? "neutral" : "success"}>{a.clock_out ? "terminé" : "en cours"}</Badge>
              </div>
            ))}
          </Card>
        ))}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nouveau créneau">
        <form onSubmit={createShift} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Employé</Label>
            <select
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user?.name ?? `Employé #${emp.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Début</Label>
              <Input type="datetime-local" required value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Fin</Label>
              <Input type="datetime-local" required value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Poste (optionnel)</Label>
            <Input value={form.role_label} onChange={(e) => setForm({ ...form, role_label: e.target.value })} placeholder="Service, cuisine…" />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Ajout…" : "Planifier"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

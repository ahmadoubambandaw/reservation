import { ArrowUpRight, CalendarCheck, CreditCard, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Stylised, static preview of the dashboard shown in the hero. */
export function HeroPreview() {
  return (
    <Card className="mx-auto max-w-4xl overflow-hidden p-0 shadow-2xl ring-1 ring-border">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-muted-foreground">
          app.ndaw-resto.com/dashboard
        </span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        {[
          { icon: CreditCard, label: "Revenus du jour", value: "485 000 F", tone: "text-primary" },
          { icon: CalendarCheck, label: "Réservations", value: "24", tone: "text-accent" },
          { icon: Users, label: "Tables occupées", value: "12 / 18", tone: "text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <s.icon className={`size-5 ${s.tone}`} />
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Évolution des ventes</span>
            <span className="text-xs text-muted-foreground">7 derniers jours</span>
          </div>
          <div className="flex h-28 items-end gap-2">
            {[45, 62, 38, 72, 55, 88, 68].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

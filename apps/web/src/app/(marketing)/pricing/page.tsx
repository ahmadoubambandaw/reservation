"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { MODULE_MAP } from "@/lib/modules";
import type { ModuleKey, Plan } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

// Modules unlocked per plan (mirrors the API PlanSeeder).
const PLAN_MODULES: Record<string, ModuleKey[]> = {
  free: ["reservations", "menu"],
  basic: ["reservations", "menu", "pos", "crm", "kitchen_display"],
  pro: ["reservations", "menu", "pos", "crm", "kitchen_display", "inventory", "reports", "staff", "marketing"],
  enterprise: ["reservations", "menu", "pos", "crm", "kitchen_display", "inventory", "reports", "staff", "marketing", "accounting", "settings"],
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    api
      .get<{ data: Plan[] }>("/plans")
      .then((r) => setPlans(r.data))
      .catch(() => setPlans([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Une tarification simple
        </h1>
        <p className="mt-4 text-muted-foreground">
          Commencez gratuitement, évoluez quand vous grandissez. Changez de plan
          à tout moment.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-4">
        {!plans
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[520px] w-full" />
            ))
          : plans.map((plan, i) => {
              const popular = plan.slug === "pro";
              const modules = PLAN_MODULES[plan.slug] ?? [];
              return (
                <Reveal key={plan.id} delay={i * 0.06}>
                  <Card
                    className={cn(
                      "flex h-full flex-col p-6",
                      popular && "border-primary shadow-lg ring-1 ring-primary/30",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {popular && <Badge>Populaire</Badge>}
                    </div>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight">
                        {plan.price === 0 ? "Gratuit" : formatMoney(plan.price, plan.currency)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">/mois</span>
                      )}
                    </div>
                    {plan.trial_days > 0 && (
                      <p className="mt-1 text-xs text-primary">
                        {plan.trial_days} jours d&apos;essai gratuit
                      </p>
                    )}

                    <Button
                      asChild
                      className="mt-5"
                      variant={popular ? "primary" : "outline"}
                    >
                      <Link href={`/register?plan=${plan.slug}`}>Choisir {plan.name}</Link>
                    </Button>

                    <ul className="mt-6 space-y-2.5">
                      {modules.map((key) => (
                        <li key={key} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 shrink-0 text-primary" />
                          {MODULE_MAP[key]?.name ?? key}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>
              );
            })}
      </div>
    </div>
  );
}

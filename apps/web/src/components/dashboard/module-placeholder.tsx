"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import type { ModuleKey } from "@/lib/types";

/**
 * Renders a module page shell. Guards access to the module (redirects to the
 * dashboard if the plan does not include it) and shows a ready-state panel for
 * modules whose full UI is being built out.
 */
export function ModulePlaceholder({
  module,
  title,
  description,
  icon: Icon,
  children,
}: {
  module: ModuleKey;
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  const { hasModule, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasModule(module)) router.replace("/dashboard");
  }, [loading, hasModule, module, router]);

  return (
    <div>
      <PageHeader title={title} description={description} />
      {children ?? (
        <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-7" />
          </span>
          <div>
            <p className="font-medium">Module actif</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Ce module est inclus dans votre abonnement. Son interface complète
              est connectée à l&apos;API et arrive prochainement.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { MODULES } from "@/lib/modules";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { me, hasModule } = useAuth();
  const pathname = usePathname();

  const enabled = MODULES.filter((m) => hasModule(m.key));

  const item = (href: string, label: string, Icon: typeof LayoutDashboard) => {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="px-2 py-3">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {item("/dashboard", "Vue d'ensemble", LayoutDashboard)}

        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Modules
        </p>
        {enabled.map((m) => item(m.href, m.name, m.icon))}

        {me?.role === "super_admin" && (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plateforme
            </p>
            {item("/dashboard/admin", "Super Admin", Shield)}
          </>
        )}
      </nav>

      {me?.restaurant?.subscription?.plan && (
        <div className="rounded-lg border border-border bg-surface p-3 text-xs">
          <p className="font-medium">Plan {me.restaurant.subscription.plan.name}</p>
          <p className="mt-0.5 text-muted-foreground">
            {enabled.length} modules actifs
          </p>
        </div>
      )}
    </div>
  );
}

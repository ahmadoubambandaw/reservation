"use client";

import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="reports"
      title="Rapports"
      description="Ventes, réservations, plats populaires et employés."
      icon={BarChart3}
    />
  );
}

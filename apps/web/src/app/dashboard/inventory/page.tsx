"use client";

import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="inventory"
      title="Stocks"
      description="Ingrédients, fournisseurs, achats, inventaire et alertes."
      icon={Package}
    />
  );
}

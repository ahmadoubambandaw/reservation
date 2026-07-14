"use client";

import { ChefHat } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="kitchen_display"
      title="Écran cuisine"
      description="File des commandes : en attente, préparation, prêt, servi."
      icon={ChefHat}
    />
  );
}

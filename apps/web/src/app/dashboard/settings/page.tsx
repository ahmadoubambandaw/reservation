"use client";

import { Settings2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="settings"
      title="Paramètres"
      description="Thème, couleurs, logo et domaine personnalisé."
      icon={Settings2}
    />
  );
}

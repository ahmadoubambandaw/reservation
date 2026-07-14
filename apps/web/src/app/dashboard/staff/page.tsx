"use client";

import { Sparkles } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="staff"
      title="Personnel"
      description="Rôles, permissions, horaires et présence."
      icon={Sparkles}
    />
  );
}

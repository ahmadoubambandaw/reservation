"use client";

import { Wallet } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="accounting"
      title="Comptabilité"
      description="Revenus, dépenses et bénéfices."
      icon={Wallet}
    />
  );
}

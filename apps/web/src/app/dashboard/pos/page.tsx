"use client";

import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="pos"
      title="Point de vente"
      description="Encaissement, caisse, ticket et paiements."
      icon={CreditCard}
    />
  );
}

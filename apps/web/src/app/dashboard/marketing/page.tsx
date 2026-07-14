"use client";

import { Megaphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      module="marketing"
      title="Marketing"
      description="Campagnes SMS, Email, WhatsApp et promotions."
      icon={Megaphone}
    />
  );
}

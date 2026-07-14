"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

const ITEMS = [
  {
    q: "Qu'est-ce que Ndaw-Resto ?",
    a: "Une plateforme SaaS multi-tenant qui réunit tous les outils de gestion d'un restaurant : réservations, point de vente, cuisine, stocks, CRM, comptabilité, marketing et rapports.",
  },
  {
    q: "Puis-je activer seulement certains modules ?",
    a: "Oui. Chaque module s'active ou se désactive selon votre plan d'abonnement. Vous ne payez que pour ce dont vous avez besoin et pouvez évoluer à tout moment.",
  },
  {
    q: "Mes données sont-elles isolées des autres restaurants ?",
    a: "Absolument. L'architecture multi-tenant garantit qu'aucun restaurant ne peut accéder aux données d'un autre.",
  },
  {
    q: "Y aura-t-il une application mobile ?",
    a: "L'ensemble repose sur une API REST unique, prête à alimenter une application mobile Flutter en plus du web.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <Card key={item.q} className="overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-medium">{item.q}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

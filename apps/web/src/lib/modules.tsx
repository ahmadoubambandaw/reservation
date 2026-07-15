import {
  BarChart3,
  CalendarCheck,
  ChefHat,
  CreditCard,
  Megaphone,
  Package,
  Settings2,
  Sparkles,
  UsersRound,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import type { ModuleKey } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

export interface ModuleMeta {
  key: ModuleKey;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const MODULES: ModuleMeta[] = [
  {
    key: "reservations",
    name: "Réservations",
    description: "Gérez tables, créneaux et confirmations en temps réel.",
    icon: CalendarCheck,
    href: "/dashboard/reservations",
  },
  {
    key: "menu",
    name: "Menu",
    description: "Cartes, catégories, plats, prix et QR menu.",
    icon: UtensilsCrossed,
    href: "/dashboard/menu",
  },
  {
    key: "pos",
    name: "Point de vente",
    description: "Encaissement, caisse, ticket et paiements.",
    icon: CreditCard,
    href: "/dashboard/pos",
  },
  {
    key: "kitchen_display",
    name: "Écran cuisine",
    description: "File des commandes, préparation, prêt, servi.",
    icon: ChefHat,
    href: "/dashboard/kitchen",
  },
  {
    key: "inventory",
    name: "Stocks",
    description: "Ingrédients, fournisseurs, achats et alertes.",
    icon: Package,
    href: "/dashboard/inventory",
  },
  {
    key: "crm",
    name: "CRM",
    description: "Historique, fidélité, coupons et anniversaires.",
    icon: UsersRound,
    href: "/dashboard/customers",
  },
  {
    key: "accounting",
    name: "Comptabilité",
    description: "Revenus, dépenses et bénéfices.",
    icon: Wallet,
    href: "/dashboard/accounting",
  },
  {
    key: "marketing",
    name: "Marketing",
    description: "Campagnes SMS, Email, WhatsApp et promotions.",
    icon: Megaphone,
    href: "/dashboard/marketing",
  },
  {
    key: "reports",
    name: "Rapports",
    description: "Ventes, réservations, plats et employés.",
    icon: BarChart3,
    href: "/dashboard/reports",
  },
  {
    key: "staff",
    name: "Personnel",
    description: "Rôles, horaires et présence.",
    icon: Sparkles,
    href: "/dashboard/staff",
  },
  {
    key: "settings",
    name: "Paramètres",
    description: "Thème, couleurs, logo et domaine personnalisé.",
    icon: Settings2,
    href: "/dashboard/settings",
  },
];

export const MODULE_MAP = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleMeta>;

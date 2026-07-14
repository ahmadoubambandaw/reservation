export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_super_admin: boolean;
  two_factor_enabled: boolean;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  billing_period: string;
  trial_days: number;
  features: string[];
  limits: Record<string, number | null>;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  location: { lat: number | null; lng: number | null };
  currency: string;
  services: string[];
  status: string;
  branding?: {
    theme: string;
    primary_color: string;
    secondary_color: string;
    custom_domain: string | null;
  };
  subscription?: { status: string; plan?: Plan } | null;
}

export type ModuleKey =
  | "reservations"
  | "menu"
  | "pos"
  | "kitchen_display"
  | "inventory"
  | "crm"
  | "accounting"
  | "marketing"
  | "reports"
  | "staff"
  | "settings";

export interface MeResponse {
  user: User;
  restaurant: Restaurant | null;
  role: string | null;
  permissions: string[];
  modules: ModuleKey[];
  restaurants: Restaurant[];
}

export interface Paginated<T> {
  data: T[];
  meta?: { current_page: number; last_page: number; total: number };
  links?: unknown;
}

export interface Reservation {
  id: number;
  code: string;
  guest_name: string | null;
  guest_phone: string | null;
  reserved_at: string;
  party_size: number;
  status: string;
  notes: string | null;
  table?: { id: number; name: string } | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  is_active: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  is_featured: boolean;
}

export interface DashboardData {
  date: string;
  revenue_today: number;
  orders_today: number;
  reservations_today: number;
  tables: { total: number; occupied: number; reserved: number; available: number };
  orders_by_status: Record<string, number>;
}

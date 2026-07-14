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

export interface OrderItem {
  id: number;
  menu_item_id: number | null;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  id: number;
  code: string;
  type: "dine_in" | "takeaway" | "delivery";
  status: string;
  payment_status: "unpaid" | "partial" | "paid" | "refunded";
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  table?: { id: number; name: string } | null;
  items?: OrderItem[];
  created_at?: string;
}

export interface CashSession {
  id: number;
  opening_float: number;
  expected_amount: number | null;
  counted_amount: number | null;
  difference: number | null;
  status: "open" | "closed";
  opened_at: string | null;
  closed_at: string | null;
}

export interface Ticket {
  restaurant: { name: string; address: string | null; phone: string | null };
  code: string;
  type: string;
  table: string | null;
  date: string;
  items: { name: string; quantity: number; unit_price: number; total: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  change: number;
  currency: string;
}

export interface SalesReport {
  range: { from: string; to: string };
  total_revenue: number;
  orders_count: number;
  average_ticket: number;
  by_type: { type: string; count: number; revenue: number }[];
  by_day: { day: string; revenue: number }[];
}

export interface PopularDish {
  name: string;
  quantity: number;
  revenue: number;
}

export interface ReservationsReport {
  total: number;
  by_status: Record<string, number>;
  covers: number;
}

export interface EmployeeReport {
  employee: string | null;
  orders: number;
  revenue: number;
}

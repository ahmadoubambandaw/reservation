<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use App\Services\RestaurantProvisioner;
use App\Tenancy\TenantManager;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Super admin -------------------------------------------------
        User::updateOrCreate(
            ['email' => 'admin@ndaw-resto.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_super_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        // Demo restaurant owner + tenant ------------------------------
        $owner = User::updateOrCreate(
            ['email' => 'owner@ledakar.com'],
            [
                'name' => 'Awa Diop',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        // Avoid duplicating the demo restaurant on re-seed.
        if ($owner->ownedRestaurants()->exists()) {
            return;
        }

        $restaurant = app(RestaurantProvisioner::class)->provision($owner, 'Le Dakar', 'pro');
        $restaurant->update([
            'description' => 'Cuisine sénégalaise moderne au cœur de Dakar.',
            'email' => 'contact@ledakar.com',
            'phone' => '+221 33 800 00 00',
            'address' => 'Avenue Cheikh Anta Diop',
            'city' => 'Dakar',
            'country' => 'SN',
            'latitude' => 14.6928,
            'longitude' => -17.4467,
            'services' => ['dine_in', 'takeaway', 'delivery'],
            'opening_hours' => [
                'mon' => [['open' => '11:00', 'close' => '23:00']],
                'tue' => [['open' => '11:00', 'close' => '23:00']],
            ],
        ]);

        // Seed tenant-owned data inside the restaurant's context.
        app(TenantManager::class)->forRestaurant($restaurant, function () use ($restaurant) {
            // Staff
            $this->addStaff($restaurant, 'Manager Fatou', 'manager@ledakar.com', Role::MANAGER);
            $this->addStaff($restaurant, 'Serveur Modou', 'waiter@ledakar.com', Role::WAITER);
            $this->addStaff($restaurant, 'Cuisine Ndeye', 'kitchen@ledakar.com', Role::KITCHEN);

            // Tables
            foreach (range(1, 8) as $n) {
                RestaurantTable::create([
                    'name' => "Table {$n}",
                    'capacity' => $n % 2 === 0 ? 4 : 2,
                    'location' => $n <= 4 ? 'indoor' : 'terrace',
                ]);
            }

            // Menu
            $catFood = Category::create(['name' => 'Plats', 'type' => 'food', 'sort_order' => 1]);
            $catDrink = Category::create(['name' => 'Boissons', 'type' => 'drink', 'sort_order' => 2]);
            $catDessert = Category::create(['name' => 'Desserts', 'type' => 'dessert', 'sort_order' => 3]);

            $items = [
                [$catFood, 'Thiéboudienne', 4500, true],
                [$catFood, 'Yassa Poulet', 4000, true],
                [$catFood, 'Mafé', 3800, false],
                [$catDrink, 'Bissap', 1000, false],
                [$catDrink, 'Jus de Bouye', 1200, false],
                [$catDessert, 'Thiakry', 1500, false],
            ];
            foreach ($items as [$cat, $name, $price, $featured]) {
                MenuItem::create([
                    'category_id' => $cat->id,
                    'name' => $name,
                    'price' => $price,
                    'is_featured' => $featured,
                ]);
            }

            // Customers + reservations
            $customer = Customer::create([
                'name' => 'Ibrahima Fall',
                'phone' => '+221 77 123 45 67',
                'email' => 'ibrahima@example.com',
                'loyalty_points' => 120,
                'visits_count' => 6,
            ]);

            Reservation::create([
                'customer_id' => $customer->id,
                'table_id' => RestaurantTable::first()->id,
                'reserved_at' => now()->addDay()->setTime(20, 0),
                'party_size' => 4,
                'status' => 'confirmed',
                'guest_name' => $customer->name,
                'guest_phone' => $customer->phone,
            ]);

            // Inventory (stocks) demo
            $supplier = Supplier::create(['name' => 'Marché Kermel', 'phone' => '+221 77 555 00 00']);
            Ingredient::create(['supplier_id' => $supplier->id, 'name' => 'Riz brisé', 'unit' => 'kg', 'stock_quantity' => 4, 'reorder_level' => 20, 'cost_per_unit' => 600]);
            Ingredient::create(['supplier_id' => $supplier->id, 'name' => 'Poisson thiof', 'unit' => 'kg', 'stock_quantity' => 30, 'reorder_level' => 10, 'cost_per_unit' => 3500]);

            // Accounting demo
            Expense::create(['category' => 'utilities', 'description' => 'Électricité', 'amount' => 85000, 'spent_at' => now()->startOfMonth()]);

            // Orders + payments demo (populate POS & Reports).
            $this->seedOrders($restaurant);
        });
    }

    /** Create a spread of paid orders over the last two weeks. */
    private function seedOrders($restaurant): void
    {
        $menuItems = MenuItem::all();
        $tables = RestaurantTable::all();
        $ownerEmployee = Employee::where('user_id', $restaurant->owner_id)->first();
        $methods = ['cash', 'wave', 'orange_money'];
        $types = ['dine_in', 'dine_in', 'takeaway', 'delivery'];

        for ($i = 0; $i < 24; $i++) {
            $when = now()->subDays(random_int(0, 13))->setTime(random_int(11, 22), random_int(0, 59));
            $type = $types[array_rand($types)];

            $order = Order::create([
                'employee_id' => $ownerEmployee?->id,
                'table_id' => $type === 'dine_in' ? $tables->random()->id : null,
                'type' => $type,
                'status' => 'completed',
                'payment_status' => 'paid',
            ]);

            foreach ($menuItems->random(random_int(1, 3)) as $mi) {
                $qty = random_int(1, 3);
                $order->items()->create([
                    'menu_item_id' => $mi->id,
                    'name' => $mi->name,
                    'quantity' => $qty,
                    'unit_price' => $mi->price,
                    'total' => $mi->price * $qty,
                    'status' => 'served',
                ]);
            }

            $order->load('items');
            $order->recalculate(0.0);
            $order->save();

            $payment = $order->payments()->create([
                'restaurant_id' => $restaurant->id,
                'amount' => $order->total,
                'currency' => 'XOF',
                'method' => $methods[array_rand($methods)],
                'status' => 'succeeded',
                'paid_at' => $when,
            ]);

            // Backdate rows so Reports show a realistic time series.
            Order::whereKey($order->id)->update(['created_at' => $when, 'updated_at' => $when]);
            Payment::whereKey($payment->id)->update(['created_at' => $when, 'updated_at' => $when]);
        }
    }

    private function addStaff($restaurant, string $name, string $email, string $roleSlug): void
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'email_verified_at' => now()],
        );

        Employee::create([
            'restaurant_id' => $restaurant->id,
            'user_id' => $user->id,
            'role_id' => Role::where('slug', $roleSlug)->first()->id,
            'status' => 'active',
            'hired_at' => now(),
        ]);
    }
}

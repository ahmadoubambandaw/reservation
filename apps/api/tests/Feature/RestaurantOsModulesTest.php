<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Plan;
use App\Services\ModuleManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantOsModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_module_gating_blocks_route_not_in_plan(): void
    {
        // Pro plan does NOT include the settings (branding) module.
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/settings/branding')
            ->assertForbidden();

        // Downgrade to free → inventory becomes unavailable too.
        $free = Plan::where('slug', 'free')->first();
        $restaurant->subscription->update(['plan_id' => $free->id]);
        // Real requests are isolated processes; clear the per-restaurant memo
        // so this second call resolves modules as a fresh request would.
        app(ModuleManager::class)->forget($restaurant);

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/ingredients')
            ->assertForbidden();
    }

    public function test_enterprise_plan_unlocks_settings_module(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $enterprise = Plan::where('slug', 'enterprise')->first();
        $restaurant->subscription->update(['plan_id' => $enterprise->id]);

        $this->actingAs($owner, 'sanctum')
            ->putJson('/api/v1/settings/branding', ['theme' => 'dark', 'primary_color' => '#ff8800'])
            ->assertOk()
            ->assertJsonPath('data.branding.theme', 'dark');
    }

    public function test_pos_cash_flow_marks_order_paid_and_reconciles(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $item = $this->withinTenant($restaurant, fn () => MenuItem::create(['name' => 'Plat', 'price' => 5000]));

        // Create an order via the API.
        $order = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/orders', [
            'type' => 'dine_in',
            'items' => [['menu_item_id' => $item->id, 'quantity' => 2]],
        ])->assertCreated()->json('data');

        $this->assertEquals(10000, $order['total']);

        // Open register.
        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/pos/sessions', ['opening_float' => 20000])
            ->assertCreated();

        // Pay in cash.
        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/orders/{$order['code']}/payments", ['amount' => 10000, 'method' => 'cash'])
            ->assertCreated()
            ->assertJsonPath('order_payment_status', 'paid');

        // Close register: expected = float 20000 + 10000 cash = 30000.
        $session = $this->actingAs($owner, 'sanctum')->getJson('/api/v1/pos/sessions/current')->json('data');
        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/pos/sessions/{$session['id']}/close", ['counted_amount' => 30000])
            ->assertOk()
            ->assertJsonPath('data.difference', '0.00');
    }

    public function test_inventory_purchase_receive_increases_stock(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $ing = $this->withinTenant($restaurant, fn () => Ingredient::create([
            'name' => 'Riz', 'unit' => 'kg', 'stock_quantity' => 5, 'reorder_level' => 10,
        ]));

        // Low-stock alert should list it.
        $this->actingAs($owner, 'sanctum')->getJson('/api/v1/ingredients/alerts')
            ->assertOk()->assertJsonFragment(['name' => 'Riz']);

        $purchase = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/purchases', [
            'items' => [['ingredient_id' => $ing->id, 'quantity' => 20, 'unit_cost' => 500]],
        ])->assertCreated()->json('data');

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/purchases/{$purchase['id']}/receive")->assertOk();

        $this->assertEquals(25, (float) $ing->fresh()->stock_quantity);
    }

    public function test_accounting_summary_computes_profit(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        // Accounting is an Enterprise-tier module.
        $restaurant->subscription->update(['plan_id' => Plan::where('slug', 'enterprise')->first()->id]);

        $this->withinTenant($restaurant, function () {
            Order::create(['type' => 'dine_in', 'status' => 'completed', 'payment_status' => 'paid', 'total' => 50000]);
        });

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/expenses', [
            'category' => 'supplies', 'amount' => 20000, 'spent_at' => now()->toDateString(),
        ])->assertCreated();

        $this->actingAs($owner, 'sanctum')->getJson('/api/v1/accounting/summary')
            ->assertOk()
            ->assertJsonPath('data.revenue', 50000)
            ->assertJsonPath('data.expenses', 20000)
            ->assertJsonPath('data.profit', 30000);
    }

    public function test_staff_clock_in_and_out(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/attendances/clock-in')->assertCreated();
        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/attendances/clock-out')
            ->assertOk()->assertJsonStructure(['hours_worked']);
    }

    public function test_marketing_campaign_send(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $campaign = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/campaigns', [
            'name' => 'Promo', 'channel' => 'sms', 'audience' => 'all', 'message' => 'Bienvenue !',
        ])->assertCreated()->json('data');

        $this->actingAs($owner, 'sanctum')->postJson("/api/v1/campaigns/{$campaign['id']}/send")
            ->assertOk()->assertJsonPath('data.status', 'sent');
    }

    public function test_kitchen_bump_advances_order(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $item = $this->withinTenant($restaurant, fn () => MenuItem::create(['name' => 'Plat', 'price' => 3000]));

        $order = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/orders', [
            'type' => 'dine_in',
            'items' => [['menu_item_id' => $item->id, 'quantity' => 1]],
        ])->json('data');

        $this->actingAs($owner, 'sanctum')->postJson("/api/v1/kitchen/orders/{$order['code']}/bump")
            ->assertOk()->assertJsonPath('data.status', 'preparing');
    }
}

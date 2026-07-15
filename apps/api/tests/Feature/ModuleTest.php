<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Services\ModuleManager;
use App\Support\Modules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_modules_endpoint_reflects_plan(): void
    {
        // makeRestaurant() provisions on the "pro" plan.
        [$restaurant, $owner] = $this->makeRestaurant();

        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/v1/modules');
        $response->assertOk();

        $modules = collect($response->json('data'))->keyBy('key');

        $this->assertTrue($modules[Modules::INVENTORY]['enabled']);   // pro includes inventory
        $this->assertTrue($modules[Modules::POS]['enabled']);
        $this->assertFalse($modules[Modules::SETTINGS]['enabled']);   // enterprise-only
    }

    public function test_free_plan_only_has_core_modules(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $free = Plan::where('slug', 'free')->first();
        $restaurant->subscription->update(['plan_id' => $free->id]);
        $restaurant->load('subscription.plan');
        app(ModuleManager::class)->forget($restaurant);

        $this->assertTrue($restaurant->hasModule(Modules::RESERVATIONS));
        $this->assertTrue($restaurant->hasModule(Modules::MENU));
        $this->assertFalse($restaurant->hasModule(Modules::POS));
        $this->assertFalse($restaurant->hasModule(Modules::INVENTORY));
    }
}

<?php

namespace Tests\Feature;

use App\Models\RestaurantTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_owner_only_sees_own_tables(): void
    {
        [$restA, $ownerA] = $this->makeRestaurant('Resto A');
        [$restB, $ownerB] = $this->makeRestaurant('Resto B');

        $tableA = $this->withinTenant($restA, fn () => RestaurantTable::create(['name' => 'A1', 'capacity' => 2]));
        $this->withinTenant($restB, fn () => RestaurantTable::create(['name' => 'B1', 'capacity' => 2]));

        $response = $this->actingAs($ownerA, 'sanctum')->getJson('/api/v1/tables');
        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');
        $this->assertContains('A1', $names);
        $this->assertNotContains('B1', $names);
    }

    public function test_cannot_read_another_tenants_table_by_id(): void
    {
        [$restA, $ownerA] = $this->makeRestaurant('Resto A');
        [$restB] = $this->makeRestaurant('Resto B');

        $tableB = $this->withinTenant($restB, fn () => RestaurantTable::create(['name' => 'B1', 'capacity' => 2]));

        // Owner A tries to fetch Owner B's table by its real id → 404, never a leak.
        $this->actingAs($ownerA, 'sanctum')
            ->getJson("/api/v1/tables/{$tableB->id}")
            ->assertNotFound();
    }

    public function test_cannot_update_another_tenants_table(): void
    {
        [$restA, $ownerA] = $this->makeRestaurant('Resto A');
        [$restB] = $this->makeRestaurant('Resto B');

        $tableB = $this->withinTenant($restB, fn () => RestaurantTable::create(['name' => 'B1', 'capacity' => 2]));

        $this->actingAs($ownerA, 'sanctum')
            ->putJson("/api/v1/tables/{$tableB->id}", ['name' => 'hacked'])
            ->assertNotFound();

        $this->assertDatabaseHas('restaurant_tables', ['id' => $tableB->id, 'name' => 'B1']);
    }
}

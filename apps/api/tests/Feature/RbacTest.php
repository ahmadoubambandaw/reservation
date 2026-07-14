<?php

namespace Tests\Feature;

use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_waiter_cannot_manage_menu_but_can_view(): void
    {
        [$restaurant] = $this->makeRestaurant();
        $waiter = $this->makeStaff($restaurant, Role::WAITER);

        // Waiter has menu.view
        $this->actingAs($waiter, 'sanctum')
            ->getJson('/api/v1/categories')
            ->assertOk();

        // ...but not menu.manage
        $this->actingAs($waiter, 'sanctum')
            ->postJson('/api/v1/categories', ['name' => 'Entrées'])
            ->assertForbidden();
    }

    public function test_owner_can_manage_menu(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/categories', ['name' => 'Entrées'])
            ->assertCreated();
    }

    public function test_kitchen_cannot_touch_reservations(): void
    {
        [$restaurant] = $this->makeRestaurant();
        $kitchen = $this->makeStaff($restaurant, Role::KITCHEN);

        $this->actingAs($kitchen, 'sanctum')
            ->getJson('/api/v1/reservations')
            ->assertForbidden();
    }

    public function test_non_super_admin_blocked_from_admin_area(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/admin/stats')
            ->assertForbidden();
    }
}

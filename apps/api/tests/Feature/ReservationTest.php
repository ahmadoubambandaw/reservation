<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\RestaurantTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_owner_can_create_and_list_reservations(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();
        $table = $this->withinTenant($restaurant, fn () => RestaurantTable::create(['name' => 'T1', 'capacity' => 4]));

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/reservations', [
            'reserved_at' => now()->addDay()->toDateTimeString(),
            'party_size' => 3,
            'table_id' => $table->id,
            'guest_name' => 'Client Test',
            'guest_phone' => '+221770000000',
        ])->assertCreated()->assertJsonPath('data.party_size', 3);

        $this->actingAs($owner, 'sanctum')->getJson('/api/v1/reservations')
            ->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_public_guest_booking_creates_pending_reservation(): void
    {
        [$restaurant] = $this->makeRestaurant();
        $restaurant->update(['status' => 'active']);

        $this->postJson("/api/v1/restaurants/{$restaurant->slug}/reservations", [
            'guest_name' => 'Invité',
            'guest_phone' => '+221771112233',
            'reserved_at' => now()->addDays(2)->toDateTimeString(),
            'party_size' => 2,
        ])->assertCreated()->assertJsonPath('data.status', 'pending');

        $this->assertSame(1, $this->withinTenant($restaurant, fn () => Reservation::count()));
    }

    public function test_public_booking_requires_future_date(): void
    {
        [$restaurant] = $this->makeRestaurant();

        $this->postJson("/api/v1/restaurants/{$restaurant->slug}/reservations", [
            'guest_name' => 'Invité',
            'guest_phone' => '+221771112233',
            'reserved_at' => now()->subDay()->toDateTimeString(),
            'party_size' => 2,
        ])->assertStatus(422);
    }
}

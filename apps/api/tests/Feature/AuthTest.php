<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_registration_bootstraps_a_restaurant_and_owner(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Awa',
            'email' => 'awa@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'restaurant_name' => 'Chez Awa',
            'plan' => 'basic',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'email'], 'restaurant' => ['id', 'slug']]);

        $user = User::where('email', 'awa@example.com')->first();
        $restaurant = Restaurant::where('name', 'Chez Awa')->first();

        $this->assertNotNull($restaurant);
        $this->assertTrue($restaurant->owner->is($user));
        $this->assertDatabaseHas('employees', [
            'restaurant_id' => $restaurant->id,
            'user_id' => $user->id,
        ]);
        $this->assertTrue($restaurant->subscription->plan->slug === 'basic');
        $this->assertTrue($user->hasRole('restaurant_owner', $restaurant->id));
    }

    public function test_login_returns_token_and_rejects_bad_credentials(): void
    {
        $user = User::factory()->create(['password' => 'secret123']);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->assertOk()->assertJsonStructure(['token', 'user']);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ])->assertStatus(422);
    }

    public function test_me_returns_role_and_permissions(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('role', 'restaurant_owner')
            ->assertJsonPath('restaurant.slug', $restaurant->slug);
    }

    public function test_guest_cannot_access_protected_route(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
    }
}

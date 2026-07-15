<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_site_returns_aggregated_payload(): void
    {
        [$restaurant] = $this->makeRestaurant('Chez Awa');

        $this->withinTenant($restaurant, function () {
            $cat = Category::create(['name' => 'Plats', 'type' => 'food']);
            MenuItem::create(['category_id' => $cat->id, 'name' => 'Yassa', 'price' => 4000]);
            Review::create(['rating' => 5, 'comment' => 'Excellent', 'status' => 'approved']);
        });

        $this->getJson("/api/v1/sites/{$restaurant->slug}")
            ->assertOk()
            ->assertJsonPath('restaurant.slug', $restaurant->slug)
            ->assertJsonPath('rating.count', 1)
            ->assertJsonPath('rating.average', 5)
            ->assertJsonCount(1, 'menu')
            ->assertJsonPath('menu.0.items.0.name', 'Yassa');
    }

    public function test_site_hidden_for_inactive_restaurant(): void
    {
        [$restaurant] = $this->makeRestaurant();
        $restaurant->update(['status' => 'suspended']);

        $this->getJson("/api/v1/sites/{$restaurant->slug}")->assertNotFound();
    }

    public function test_resolve_by_custom_domain(): void
    {
        [$restaurant] = $this->makeRestaurant('Le Baobab');
        $restaurant->update(['custom_domain' => 'lebaobab.com']);

        $this->getJson('/api/v1/sites/resolve?domain=lebaobab.com')
            ->assertOk()
            ->assertJsonPath('slug', $restaurant->slug);
    }

    public function test_resolve_by_subdomain(): void
    {
        [$restaurant] = $this->makeRestaurant('Le Baobab');

        $this->getJson("/api/v1/sites/resolve?domain={$restaurant->slug}.ndaw-resto.com")
            ->assertOk()
            ->assertJsonPath('slug', $restaurant->slug);
    }
}

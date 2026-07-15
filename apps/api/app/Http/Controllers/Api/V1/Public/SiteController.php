<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\RestaurantResource;
use App\Http\Resources\ReviewResource;
use App\Models\Restaurant;
use App\Tenancy\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Powers each restaurant's own public website (the "ecosystem" storefront).
 * A single aggregated payload keeps the microsite fast, and a domain resolver
 * lets custom domains / subdomains map to the right restaurant.
 */
class SiteController extends Controller
{
    public function __construct(protected TenantManager $tenant) {}

    /** Everything the branded microsite needs, in one request. */
    public function show(Restaurant $restaurant): JsonResponse
    {
        abort_unless($restaurant->status === 'active', 404);

        return $this->tenant->forRestaurant($restaurant, function () use ($restaurant) {
            $categories = $restaurant->categories()
                ->where('is_active', true)
                ->with(['menuItems' => fn ($q) => $q->available()->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get()
                ->filter(fn ($c) => $c->menuItems->isNotEmpty())
                ->values();

            $reviews = $restaurant->reviews()->approved()->latest()->limit(12)->get();
            $ratingAgg = $restaurant->reviews()->approved()
                ->selectRaw('avg(rating) as avg, count(*) as count')->first();

            return response()->json([
                'restaurant' => new RestaurantResource($restaurant->load('subscription.plan')),
                'menu' => CategoryResource::collection($categories)->resolve(),
                'reviews' => ReviewResource::collection($reviews)->resolve(),
                'rating' => [
                    'average' => round((float) ($ratingAgg->avg ?? 0), 1),
                    'count' => (int) ($ratingAgg->count ?? 0),
                ],
            ]);
        });
    }

    /**
     * Resolve a restaurant from a Host header (custom domain or
     * "<slug>.<platform-domain>" subdomain). Returns the slug so the frontend
     * proxy can rewrite the request to the right microsite.
     */
    public function resolve(Request $request): JsonResponse
    {
        $host = strtolower(trim((string) $request->query('domain')));
        abort_if($host === '', 404);

        // Exact custom domain match first.
        $restaurant = Restaurant::active()->where('custom_domain', $host)->first();

        // Fall back to a subdomain of the platform (e.g. "chez-awa.ndaw-resto.com").
        if (! $restaurant) {
            $sub = explode('.', $host)[0] ?? null;
            if ($sub) {
                $restaurant = Restaurant::active()->where('slug', $sub)->first();
            }
        }

        abort_unless($restaurant, 404);

        return response()->json([
            'slug' => $restaurant->slug,
            'name' => $restaurant->name,
        ]);
    }
}

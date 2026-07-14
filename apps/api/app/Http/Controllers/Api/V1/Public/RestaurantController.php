<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\RestaurantResource;
use App\Http\Resources\ReviewResource;
use App\Models\Restaurant;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;

/**
 * Public, unauthenticated discovery of active restaurants and their menus.
 * Tenant-scoped child models are read within an explicit tenant context.
 */
class RestaurantController extends Controller
{
    public function __construct(protected TenantManager $tenant) {}

    public function index(Request $request)
    {
        $query = Restaurant::active();

        if ($search = $request->query('q')) {
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('city', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%"));
        }

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        return RestaurantResource::collection(
            $query->latest()->paginate($request->integer('per_page', 12))
        );
    }

    public function show(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active', 404);

        return new RestaurantResource($restaurant);
    }

    /** Public menu grouped by active categories. */
    public function menu(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active', 404);

        $categories = $this->tenant->forRestaurant($restaurant, fn () => $restaurant->categories()
            ->where('is_active', true)
            ->with(['menuItems' => fn ($q) => $q->available()->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get());

        return CategoryResource::collection($categories);
    }

    public function reviews(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active', 404);

        $reviews = $this->tenant->forRestaurant($restaurant, fn () => $restaurant->reviews()
            ->approved()->latest()->paginate(10));

        return ReviewResource::collection($reviews);
    }
}

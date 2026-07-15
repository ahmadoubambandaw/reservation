<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\Request;

/** Super-admin management of every restaurant on the platform. */
class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        $query = Restaurant::with('subscription.plan', 'owner');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->query('q')) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        return RestaurantResource::collection(
            $query->latest()->paginate($request->integer('per_page', 20))
        );
    }

    public function show(Restaurant $restaurant)
    {
        return new RestaurantResource($restaurant->load('subscription.plan', 'owner'));
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,active,suspended'],
            'name' => ['sometimes', 'string', 'max:255'],
        ]);
        $restaurant->update($data);

        return new RestaurantResource($restaurant);
    }

    public function destroy(Restaurant $restaurant)
    {
        $restaurant->delete();

        return response()->json(['message' => 'Restaurant supprimé.']);
    }
}

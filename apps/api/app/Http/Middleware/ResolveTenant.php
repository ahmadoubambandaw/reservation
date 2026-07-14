<?php

namespace App\Http\Middleware;

use App\Models\Restaurant;
use App\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active tenant (restaurant) for an authenticated request.
 *
 * Resolution order:
 *   1. Super Admin may target any restaurant via the `X-Restaurant-Id`
 *      header (or none, to span all tenants).
 *   2. A regular user is bound to the restaurant they are an employee of.
 *      An explicit `X-Restaurant-Id` is honoured only if they actually
 *      belong to that restaurant.
 *
 * Must run after authentication.
 */
class ResolveTenant
{
    public function __construct(protected TenantManager $tenant) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $requestedId = $request->header('X-Restaurant-Id');

        if ($user->isSuperAdmin()) {
            if ($requestedId && ($restaurant = Restaurant::find($requestedId))) {
                $this->tenant->set($restaurant);
            }
            // No header → super admin spans all tenants (handled by scope check()).

            return $next($request);
        }

        $restaurant = $user->resolveRestaurant($requestedId);

        if ($restaurant) {
            $this->tenant->set($restaurant);
        }

        return $next($request);
    }
}

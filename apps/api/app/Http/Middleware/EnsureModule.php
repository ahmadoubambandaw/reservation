<?php

namespace App\Http\Middleware;

use App\Services\ModuleManager;
use App\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware: `module:inventory`.
 * Blocks the route with 403 when the active restaurant's subscription does
 * not include the given module. Super Admin bypasses the check.
 */
class EnsureModule
{
    public function __construct(
        protected TenantManager $tenant,
        protected ModuleManager $modules,
    ) {}

    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        if ($user && $user->isSuperAdmin()) {
            return $next($request);
        }

        $restaurant = $this->tenant->current();

        if (! $restaurant || ! $this->modules->isEnabled($restaurant, $module)) {
            abort(403, "Le module « {$module} » n'est pas inclus dans votre abonnement.");
        }

        return $next($request);
    }
}

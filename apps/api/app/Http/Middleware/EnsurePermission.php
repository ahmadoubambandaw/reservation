<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware: `permission:reservations.manage`.
 * Passes if the authenticated user holds ALL listed permissions in the
 * current tenant (Super Admin always passes).
 */
class EnsurePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Non authentifié.');
        }

        foreach ($permissions as $permission) {
            if (! $user->hasPermission($permission)) {
                abort(403, "Accès refusé : permission « {$permission} » requise.");
            }
        }

        return $next($request);
    }
}

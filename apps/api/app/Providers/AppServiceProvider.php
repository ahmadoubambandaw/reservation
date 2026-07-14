<?php

namespace App\Providers;

use App\Services\ModuleManager;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // One tenant context per request/job lifecycle.
        $this->app->singleton(TenantManager::class, fn () => new TenantManager);
        $this->app->alias(TenantManager::class, 'tenant');

        // Module gating resolver (per-subscription activation).
        $this->app->singleton(ModuleManager::class);
    }

    public function boot(): void
    {
        // Super Admin bypasses every ability check.
        Gate::before(function ($user, $ability) {
            return $user->isSuperAdmin() ? true : null;
        });

        // Register each RBAC permission slug as a Gate ability backed by the
        // user's tenant-scoped permission set. This lets controllers use
        // $this->authorize('reservations.manage') and policies alike.
        foreach (Permissions::all() as $slug) {
            Gate::define($slug, fn ($user) => $user->hasPermission($slug));
        }
    }
}

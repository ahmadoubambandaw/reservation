<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Support\Modules;

/**
 * Resolves which modules are enabled for a restaurant, based on its active
 * subscription plan. This is the single source of truth consulted by the
 * `module:<key>` middleware and exposed to clients (web / Flutter) so the UI
 * can show or hide features.
 */
class ModuleManager
{
    /** @var array<int, array<int, string>> memo per restaurant id */
    protected array $cache = [];

    /**
     * The module keys enabled for a restaurant. Core modules are always on;
     * the rest come from the plan. A restaurant with no active plan still
     * keeps the core modules.
     *
     * @return array<int, string>
     */
    public function enabledFor(Restaurant $restaurant): array
    {
        return $this->cache[$restaurant->id] ??= $this->resolve($restaurant);
    }

    public function isEnabled(Restaurant $restaurant, string $module): bool
    {
        return in_array($module, $this->enabledFor($restaurant), true);
    }

    /** Full catalogue with an `enabled` flag, for settings/onboarding screens. */
    public function statusFor(Restaurant $restaurant): array
    {
        $enabled = $this->enabledFor($restaurant);

        return collect(Modules::catalogue())
            ->map(fn ($meta, $key) => [
                'key' => $key,
                'name' => $meta['name'],
                'description' => $meta['description'],
                'core' => $meta['core'],
                'enabled' => in_array($key, $enabled, true),
            ])
            ->values()
            ->all();
    }

    public function forget(Restaurant $restaurant): void
    {
        unset($this->cache[$restaurant->id]);
    }

    protected function resolve(Restaurant $restaurant): array
    {
        $plan = $restaurant->subscription?->plan;

        $modules = $plan
            ? $plan->modules()
            : Modules::core();

        return array_values(array_intersect($modules, Modules::all()));
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Branding & appearance settings for the current restaurant: theme, colors,
 * logo/cover, and custom domain.
 */
class SettingsController extends Controller
{
    public function show(TenantManager $tenant)
    {
        $this->authorize(Permissions::SETTINGS_MANAGE);

        return new RestaurantResource($tenant->current());
    }

    public function update(Request $request, TenantManager $tenant)
    {
        $this->authorize(Permissions::SETTINGS_MANAGE);

        $restaurant = $tenant->current();

        $data = $request->validate([
            'theme' => ['sometimes', 'in:light,dark,system'],
            'primary_color' => ['sometimes', 'string', 'regex:/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/'],
            'secondary_color' => ['sometimes', 'string', 'regex:/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/'],
            'logo' => ['nullable', 'string'],
            'cover' => ['nullable', 'string'],
            'custom_domain' => [
                'nullable', 'string', 'max:255',
                'regex:/^([a-z0-9-]+\.)+[a-z]{2,}$/i',
                Rule::unique('restaurants', 'custom_domain')->ignore($restaurant->id),
            ],
        ]);

        $restaurant->update($data);

        return new RestaurantResource($restaurant->fresh());
    }
}

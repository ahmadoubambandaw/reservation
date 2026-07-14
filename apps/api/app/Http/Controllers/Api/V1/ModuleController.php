<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ModuleManager;
use App\Support\Modules;
use App\Tenancy\TenantManager;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    /** Full module catalogue with an `enabled` flag for the current restaurant. */
    public function index(TenantManager $tenant, ModuleManager $modules): JsonResponse
    {
        $restaurant = $tenant->current();

        $data = $restaurant
            ? $modules->statusFor($restaurant)
            : collect(Modules::catalogue())->map(fn ($m, $k) => [
                'key' => $k, 'name' => $m['name'], 'description' => $m['description'],
                'core' => $m['core'], 'enabled' => true,
            ])->values()->all();

        return response()->json(['data' => $data]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::COUPONS_MANAGE);

        return CouponResource::collection(Coupon::latest()->get());
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::COUPONS_MANAGE);

        return (new CouponResource(Coupon::create($this->rules($request))))
            ->response()->setStatusCode(201);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $this->authorize(Permissions::COUPONS_MANAGE);
        $coupon->update($this->rules($request, false, $coupon->id));

        return new CouponResource($coupon);
    }

    public function destroy(Coupon $coupon)
    {
        $this->authorize(Permissions::COUPONS_MANAGE);
        $coupon->delete();

        return response()->json(['message' => 'Coupon supprimé.']);
    }

    private function rules(Request $request, bool $creating = true, ?int $ignoreId = null): array
    {
        $required = $creating ? 'required' : 'sometimes';
        $tenantId = app(TenantManager::class)->id();

        return $request->validate([
            'code' => [
                $required, 'string', 'max:64',
                Rule::unique('coupons', 'code')
                    ->where('restaurant_id', $tenantId)
                    ->ignore($ignoreId),
            ],
            'type' => [$required, 'in:percentage,fixed'],
            'value' => [$required, 'numeric', 'min:0'],
            'min_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_happy_hour' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);
    }
}

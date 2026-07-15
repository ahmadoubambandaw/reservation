<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use App\Tenancy\TenantManager;

/** Platform-wide statistics for the super-admin dashboard. */
class StatsController extends Controller
{
    public function index(TenantManager $tenant)
    {
        return $tenant->spanAllTenants(fn () => response()->json([
            'data' => [
                'restaurants' => [
                    'total' => Restaurant::count(),
                    'active' => Restaurant::where('status', 'active')->count(),
                    'suspended' => Restaurant::where('status', 'suspended')->count(),
                ],
                'users' => User::count(),
                'subscriptions_by_status' => Subscription::selectRaw('status, count(*) as count')
                    ->groupBy('status')->pluck('count', 'status'),
                'mrr' => (float) Subscription::where('status', 'active')
                    ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
                    ->where('plans.billing_period', 'monthly')
                    ->sum('plans.price'),
                'revenue_collected' => (float) Payment::where('status', 'succeeded')->sum('amount'),
                'restaurants_by_month' => Restaurant::selectRaw("to_char(created_at, 'YYYY-MM') as month, count(*) as count")
                    ->groupByRaw("to_char(created_at, 'YYYY-MM')")->orderBy('month')
                    ->get()->map(fn ($r) => ['month' => $r->month, 'count' => (int) $r->count]),
            ],
        ]));
    }
}

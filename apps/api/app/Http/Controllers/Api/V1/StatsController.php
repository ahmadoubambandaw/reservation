<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Support\Permissions;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /** Analytics for charts: revenue evolution, popular dishes, peak hours. */
    public function overview(Request $request)
    {
        $this->authorize(Permissions::STATS_VIEW);

        $from = $request->date('from') ?? now()->subDays(30)->startOfDay();
        $to = $request->date('to') ?? now()->endOfDay();

        $paidOrders = Order::whereBetween('created_at', [$from, $to])
            ->where('payment_status', 'paid');

        return response()->json([
            'data' => [
                'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
                'totals' => [
                    'revenue' => (float) (clone $paidOrders)->sum('total'),
                    'orders' => Order::whereBetween('created_at', [$from, $to])->count(),
                    'reservations' => Reservation::whereBetween('reserved_at', [$from, $to])->count(),
                    'customers' => Customer::count(),
                ],
                'revenue_by_day' => (clone $paidOrders)
                    ->selectRaw('date(created_at) as day, sum(total) as revenue')
                    ->groupByRaw('date(created_at)')->orderBy('day')
                    ->get()->map(fn ($r) => ['day' => $r->day, 'revenue' => (float) $r->revenue]),
                'popular_items' => OrderItem::query()
                    ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$from, $to]))
                    ->selectRaw('name, sum(quantity) as qty')
                    ->groupBy('name')->orderByDesc('qty')->limit(10)
                    ->get()->map(fn ($r) => ['name' => $r->name, 'quantity' => (int) $r->qty]),
                'peak_hours' => Order::whereBetween('created_at', [$from, $to])
                    ->selectRaw('extract(hour from created_at) as hour, count(*) as count')
                    ->groupByRaw('extract(hour from created_at)')->orderBy('hour')
                    ->get()->map(fn ($r) => ['hour' => (int) $r->hour, 'count' => (int) $r->count]),
            ],
        ]);
    }
}

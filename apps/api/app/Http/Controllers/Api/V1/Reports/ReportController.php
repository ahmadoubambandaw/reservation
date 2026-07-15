<?php

namespace App\Http\Controllers\Api\V1\Reports;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Support\Permissions;
use Illuminate\Http\Request;

/**
 * Consolidated reporting for the Reports module: sales, reservations,
 * popular dishes and employee performance over a date range.
 */
class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $this->authorize(Permissions::REPORTS_VIEW);
        [$from, $to] = $this->range($request);

        $paid = Order::whereBetween('created_at', [$from, $to])->where('payment_status', 'paid');

        return response()->json(['data' => [
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'total_revenue' => (float) (clone $paid)->sum('total'),
            'orders_count' => Order::whereBetween('created_at', [$from, $to])->count(),
            'average_ticket' => round((float) (clone $paid)->avg('total'), 2),
            'by_type' => Order::whereBetween('created_at', [$from, $to])
                ->selectRaw('type, count(*) as count, sum(total) as revenue')
                ->groupBy('type')->get()
                ->map(fn ($r) => ['type' => $r->type, 'count' => (int) $r->count, 'revenue' => (float) $r->revenue]),
            'by_day' => (clone $paid)
                ->selectRaw('date(created_at) as day, sum(total) as revenue')
                ->groupByRaw('date(created_at)')->orderBy('day')
                ->get()->map(fn ($r) => ['day' => $r->day, 'revenue' => (float) $r->revenue]),
        ]]);
    }

    public function reservations(Request $request)
    {
        $this->authorize(Permissions::REPORTS_VIEW);
        [$from, $to] = $this->range($request);

        return response()->json(['data' => [
            'total' => Reservation::whereBetween('reserved_at', [$from, $to])->count(),
            'by_status' => Reservation::whereBetween('reserved_at', [$from, $to])
                ->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'covers' => (int) Reservation::whereBetween('reserved_at', [$from, $to])
                ->whereIn('status', ['confirmed', 'seated', 'completed'])->sum('party_size'),
        ]]);
    }

    public function popularDishes(Request $request)
    {
        $this->authorize(Permissions::REPORTS_VIEW);
        [$from, $to] = $this->range($request);

        return response()->json(['data' => OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$from, $to]))
            ->selectRaw('name, sum(quantity) as qty, sum(total) as revenue')
            ->groupBy('name')->orderByDesc('qty')->limit(20)
            ->get()->map(fn ($r) => [
                'name' => $r->name,
                'quantity' => (int) $r->qty,
                'revenue' => (float) $r->revenue,
            ])]);
    }

    public function employees(Request $request)
    {
        $this->authorize(Permissions::REPORTS_VIEW);
        [$from, $to] = $this->range($request);

        return response()->json(['data' => Order::query()
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('employee_id')
            ->selectRaw('employee_id, count(*) as orders, sum(total) as revenue')
            ->groupBy('employee_id')->orderByDesc('revenue')
            ->with('employee.user')
            ->get()->map(fn ($r) => [
                'employee' => $r->employee?->user?->name,
                'orders' => (int) $r->orders,
                'revenue' => (float) $r->revenue,
            ])]);
    }

    private function range(Request $request): array
    {
        return [
            $request->date('from') ?? now()->subDays(30)->startOfDay(),
            $request->date('to') ?? now()->endOfDay(),
        ];
    }
}

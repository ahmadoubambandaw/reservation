<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Support\Permissions;

class DashboardController extends Controller
{
    /** Today-at-a-glance metrics for the restaurant workspace. */
    public function index()
    {
        $this->authorize(Permissions::DASHBOARD_VIEW);

        $today = today();

        $revenueToday = Order::whereDate('created_at', $today)
            ->where('payment_status', 'paid')->sum('total');

        return response()->json([
            'data' => [
                'date' => $today->toDateString(),
                'revenue_today' => (float) $revenueToday,
                'orders_today' => Order::whereDate('created_at', $today)->count(),
                'reservations_today' => Reservation::whereDate('reserved_at', $today)->count(),
                'tables' => [
                    'total' => RestaurantTable::count(),
                    'occupied' => RestaurantTable::where('status', 'occupied')->count(),
                    'reserved' => RestaurantTable::where('status', 'reserved')->count(),
                    'available' => RestaurantTable::where('status', 'available')->count(),
                ],
                'orders_by_status' => Order::whereDate('created_at', $today)
                    ->selectRaw('status, count(*) as count')
                    ->groupBy('status')->pluck('count', 'status'),
            ],
        ]);
    }
}

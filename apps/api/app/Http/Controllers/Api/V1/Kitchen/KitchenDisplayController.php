<?php

namespace App\Http\Controllers\Api\V1\Kitchen;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\Permissions;
use Illuminate\Http\Request;

/**
 * Kitchen Display System: live queue of active orders with per-item
 * preparation status (pending → preparing → ready → served).
 */
class KitchenDisplayController extends Controller
{
    /** Active orders (not completed/cancelled) with their items, oldest first. */
    public function queue(Request $request)
    {
        $this->authorize(Permissions::ORDERS_VIEW);

        $orders = Order::with(['items', 'table'])
            ->whereIn('status', ['pending', 'preparing', 'served'])
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => $orders,
            'summary' => [
                'pending' => $orders->where('status', 'pending')->count(),
                'preparing' => $orders->where('status', 'preparing')->count(),
                'ready' => OrderItem::whereIn('order_id', $orders->pluck('id'))->where('status', 'ready')->count(),
            ],
        ]);
    }

    /** Update the preparation status of a single line item. */
    public function updateItem(Request $request, OrderItem $orderItem)
    {
        $this->authorize(Permissions::ORDERS_KITCHEN);

        // Guard: the item must belong to an order of the current tenant.
        abort_unless(
            Order::whereKey($orderItem->order_id)->exists(),
            404
        );

        $data = $request->validate([
            'status' => ['required', 'in:pending,preparing,ready,served'],
        ]);

        $orderItem->update($data);

        // Promote the order status when all items are ready/served.
        $this->syncOrderStatus($orderItem->order_id);

        return response()->json(['data' => $orderItem]);
    }

    /** Bump an entire order to the next state (preparing → served). */
    public function bump(Order $order)
    {
        $this->authorize(Permissions::ORDERS_KITCHEN);

        $next = match ($order->status) {
            'pending' => 'preparing',
            'preparing' => 'served',
            default => $order->status,
        };

        $order->update(['status' => $next]);
        $order->items()->update(['status' => $next === 'served' ? 'served' : 'preparing']);

        return response()->json(['data' => $order->load('items')]);
    }

    private function syncOrderStatus(int $orderId): void
    {
        $order = Order::find($orderId);
        if (! $order) {
            return;
        }

        $statuses = $order->items()->pluck('status');
        if ($statuses->isEmpty()) {
            return;
        }

        if ($statuses->every(fn ($s) => $s === 'served')) {
            $order->update(['status' => 'served']);
        } elseif ($statuses->contains('preparing') || $statuses->contains('ready')) {
            if ($order->status === 'pending') {
                $order->update(['status' => 'preparing']);
            }
        }
    }
}

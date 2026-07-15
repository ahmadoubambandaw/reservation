<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Role;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::ORDERS_VIEW);

        $query = Order::with(['items', 'table', 'customer']);
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return OrderResource::collection(
            $query->latest()->paginate($request->integer('per_page', 20))
        );
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::ORDERS_MANAGE);

        $data = $request->validate([
            'type' => ['required', 'in:dine_in,takeaway,delivery'],
            'table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'coupon_id' => ['nullable', 'exists:coupons,id'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $order = Order::create([
                'type' => $data['type'],
                'table_id' => $data['table_id'] ?? null,
                'customer_id' => $data['customer_id'] ?? null,
                'coupon_id' => $data['coupon_id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);

            // menu_item_id list is tenant-scoped, so foreign items resolve to nothing.
            $items = MenuItem::whereIn('id', collect($data['items'])->pluck('menu_item_id'))
                ->get()->keyBy('id');

            foreach ($data['items'] as $line) {
                $item = $items->get($line['menu_item_id']);
                if (! $item) {
                    continue;
                }
                $order->items()->create([
                    'menu_item_id' => $item->id,
                    'name' => $item->name,
                    'quantity' => $line['quantity'],
                    'unit_price' => $item->price,
                    'total' => round($item->price * $line['quantity'], 2),
                    'notes' => $line['notes'] ?? null,
                ]);
            }

            $order->load('items', 'coupon');
            $order->recalculate((float) ($data['tax_rate'] ?? 0));
            $order->save();

            return $order;
        });

        return (new OrderResource($order->load(['items', 'table', 'customer'])))
            ->response()->setStatusCode(201);
    }

    public function show(Order $order)
    {
        $this->authorize(Permissions::ORDERS_VIEW);

        return new OrderResource($order->load(['items', 'table', 'customer']));
    }

    /** Update lifecycle status. Kitchen staff may only touch preparation states. */
    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,preparing,served,completed,cancelled'],
            'payment_status' => ['sometimes', 'in:unpaid,partial,paid,refunded'],
        ]);

        $kitchenOnly = $request->user()->hasRole(Role::KITCHEN)
            && ! $request->user()->hasPermission(Permissions::ORDERS_MANAGE);

        if ($kitchenOnly) {
            $this->authorize(Permissions::ORDERS_KITCHEN);
            $data = array_intersect_key($data, ['status' => true]);
            abort_if(
                isset($data['status']) && ! in_array($data['status'], ['preparing', 'served'], true),
                403,
                'La cuisine ne peut définir que les statuts « preparing » ou « served ».'
            );
        } else {
            $this->authorize(Permissions::ORDERS_MANAGE);
        }

        $order->update($data);

        return new OrderResource($order->load('items'));
    }

    public function destroy(Order $order)
    {
        $this->authorize(Permissions::ORDERS_MANAGE);
        $order->delete();

        return response()->json(['message' => 'Commande supprimée.']);
    }

    /** Printable ticket payload (POS module). */
    public function ticket(Order $order)
    {
        $this->authorize(Permissions::ORDERS_VIEW);
        $order->load(['items', 'table', 'customer', 'restaurant']);

        $paid = $order->payments()->where('status', 'succeeded')->sum('amount');

        return response()->json([
            'data' => [
                'restaurant' => [
                    'name' => $order->restaurant->name,
                    'address' => $order->restaurant->address,
                    'phone' => $order->restaurant->phone,
                ],
                'code' => $order->code,
                'type' => $order->type,
                'table' => $order->table?->name,
                'date' => $order->created_at,
                'items' => $order->items->map(fn ($i) => [
                    'name' => $i->name,
                    'quantity' => $i->quantity,
                    'unit_price' => (float) $i->unit_price,
                    'total' => (float) $i->total,
                ]),
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax,
                'discount' => (float) $order->discount,
                'total' => (float) $order->total,
                'paid' => (float) $paid,
                'change' => round(max(0, $paid - (float) $order->total), 2),
                'currency' => $order->restaurant->currency,
            ],
        ]);
    }
}

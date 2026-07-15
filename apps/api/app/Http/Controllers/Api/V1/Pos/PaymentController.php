<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Models\CashSession;
use App\Models\Order;
use App\Models\Payment;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /** Record a payment against an order and update its payment status. */
    public function store(Request $request, Order $order, TenantManager $tenant)
    {
        $this->authorize(Permissions::POS_OPERATE);

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', 'in:stripe,wave,orange_money,cash,manual'],
            'provider_ref' => ['nullable', 'string'],
        ]);

        $payment = DB::transaction(function () use ($data, $order, $tenant) {
            $session = $data['method'] === 'cash'
                ? CashSession::open()->latest()->first()
                : null;

            $payment = $order->payments()->create([
                'restaurant_id' => $tenant->id(),
                'cash_session_id' => $session?->id,
                'amount' => $data['amount'],
                'currency' => $order->restaurant->currency ?? 'XOF',
                'method' => $data['method'],
                'status' => 'succeeded',
                'provider_ref' => $data['provider_ref'] ?? null,
                'paid_at' => now(),
            ]);

            $paid = $order->payments()->where('status', 'succeeded')->sum('amount');
            $order->payment_status = match (true) {
                $paid <= 0 => 'unpaid',
                $paid < (float) $order->total => 'partial',
                default => 'paid',
            };
            $order->save();

            return $payment;
        });

        return response()->json([
            'data' => $payment,
            'order_payment_status' => $order->payment_status,
        ], 201);
    }

    public function index(Order $order)
    {
        $this->authorize(Permissions::POS_OPERATE);

        return response()->json(['data' => $order->payments()->latest()->get()]);
    }
}

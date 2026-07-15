<?php

namespace App\Http\Controllers\Api\V1\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Order;
use App\Support\Permissions;
use Illuminate\Http\Request;

class AccountingController extends Controller
{
    /** Profit & loss summary: revenue (paid orders) - expenses = profit. */
    public function summary(Request $request)
    {
        $this->authorize(Permissions::ACCOUNTING_VIEW);

        $from = $request->date('from') ?? now()->startOfMonth();
        $to = $request->date('to') ?? now()->endOfMonth();

        $revenue = (float) Order::whereBetween('created_at', [$from, $to])
            ->where('payment_status', 'paid')->sum('total');

        $expenses = (float) Expense::whereBetween('spent_at', [$from, $to])->sum('amount');

        return response()->json([
            'data' => [
                'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
                'revenue' => $revenue,
                'expenses' => $expenses,
                'profit' => round($revenue - $expenses, 2),
                'margin' => $revenue > 0 ? round(($revenue - $expenses) / $revenue * 100, 1) : 0,
                'expenses_by_category' => Expense::whereBetween('spent_at', [$from, $to])
                    ->selectRaw('category, sum(amount) as total')
                    ->groupBy('category')->orderByDesc('total')
                    ->get()->map(fn ($r) => ['category' => $r->category, 'total' => (float) $r->total]),
            ],
        ]);
    }
}

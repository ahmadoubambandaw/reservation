<?php

namespace App\Http\Controllers\Api\V1\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Support\Permissions;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::ACCOUNTING_VIEW);

        $query = Expense::query();
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($from = $request->date('from')) {
            $query->where('spent_at', '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->where('spent_at', '<=', $to);
        }

        return $query->latest('spent_at')->paginate(20);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::ACCOUNTING_MANAGE);

        return response()->json(['data' => Expense::create($this->rules($request))], 201);
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorize(Permissions::ACCOUNTING_MANAGE);
        $expense->update($this->rules($request, false));

        return response()->json(['data' => $expense]);
    }

    public function destroy(Expense $expense)
    {
        $this->authorize(Permissions::ACCOUNTING_MANAGE);
        $expense->delete();

        return response()->json(['message' => 'Dépense supprimée.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'category' => [$required, 'string', 'max:60'],
            'description' => ['nullable', 'string'],
            'amount' => [$required, 'numeric', 'min:0'],
            'spent_at' => [$required, 'date'],
        ]);
    }
}

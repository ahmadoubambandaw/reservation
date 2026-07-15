<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Purchase;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::INVENTORY_VIEW);

        return Purchase::with('supplier', 'items')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);

        $data = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'reference' => ['nullable', 'string', 'max:255'],
            'purchased_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_id' => ['required', 'exists:ingredients,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $purchase = DB::transaction(function () use ($data) {
            $purchase = Purchase::create([
                'supplier_id' => $data['supplier_id'] ?? null,
                'reference' => $data['reference'] ?? null,
                'purchased_at' => $data['purchased_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'status' => 'ordered',
            ]);

            $ingredients = Ingredient::whereIn('id', collect($data['items'])->pluck('ingredient_id'))
                ->get()->keyBy('id');
            $total = 0;

            foreach ($data['items'] as $line) {
                $ing = $ingredients->get($line['ingredient_id']);
                if (! $ing) {
                    continue;
                }
                $lineTotal = round($line['quantity'] * $line['unit_cost'], 2);
                $total += $lineTotal;
                $purchase->items()->create([
                    'ingredient_id' => $ing->id,
                    'name' => $ing->name,
                    'quantity' => $line['quantity'],
                    'unit_cost' => $line['unit_cost'],
                    'total' => $lineTotal,
                ]);
            }

            $purchase->update(['total' => $total]);

            return $purchase;
        });

        return response()->json(['data' => $purchase->load('items')], 201);
    }

    /** Mark a purchase received: applies each line to ingredient stock. */
    public function receive(Purchase $purchase)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);
        abort_if($purchase->status === 'received', 422, 'Achat déjà réceptionné.');

        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items()->with('ingredient')->get() as $item) {
                $item->ingredient?->recordMovement('in', (float) $item->quantity, 'purchase', $purchase);
            }
            $purchase->update(['status' => 'received']);
        });

        return response()->json(['data' => $purchase->fresh('items')]);
    }
}

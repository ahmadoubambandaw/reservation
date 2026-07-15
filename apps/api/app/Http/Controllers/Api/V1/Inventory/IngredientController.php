<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Support\Permissions;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::INVENTORY_VIEW);

        $query = Ingredient::with('supplier');
        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }
        if ($search = $request->query('q')) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }

    /** Ingredients at or below their reorder level (alerts). */
    public function alerts()
    {
        $this->authorize(Permissions::INVENTORY_VIEW);

        return response()->json([
            'data' => Ingredient::lowStock()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);

        return response()->json(['data' => Ingredient::create($this->rules($request))], 201);
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);
        $ingredient->update($this->rules($request, false));

        return response()->json(['data' => $ingredient]);
    }

    public function destroy(Ingredient $ingredient)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);
        $ingredient->delete();

        return response()->json(['message' => 'Ingrédient supprimé.']);
    }

    /** Manual stock adjustment (in / out / correction) recording a movement. */
    public function adjust(Request $request, Ingredient $ingredient)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);

        $data = $request->validate([
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'numeric'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $movement = $ingredient->recordMovement($data['type'], (float) $data['quantity'], $data['reason'] ?? null);

        return response()->json([
            'data' => $ingredient->fresh(),
            'movement' => $movement,
        ]);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:20'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'stock_quantity' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'cost_per_unit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }
}

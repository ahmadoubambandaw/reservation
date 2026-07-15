<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Support\Permissions;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::INVENTORY_VIEW);

        return response()->json(['data' => Supplier::orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);

        return response()->json(['data' => Supplier::create($this->rules($request))], 201);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);
        $supplier->update($this->rules($request, false));

        return response()->json(['data' => $supplier]);
    }

    public function destroy(Supplier $supplier)
    {
        $this->authorize(Permissions::INVENTORY_MANAGE);
        $supplier->delete();

        return response()->json(['message' => 'Fournisseur supprimé.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
    }
}

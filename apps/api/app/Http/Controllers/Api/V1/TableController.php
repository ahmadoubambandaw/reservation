<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TableResource;
use App\Models\RestaurantTable;
use App\Support\Permissions;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::TABLES_VIEW);

        $query = RestaurantTable::query();
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return TableResource::collection($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::TABLES_MANAGE);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:available,occupied,reserved,out_of_service'],
        ]);

        $table = RestaurantTable::create($data);

        return (new TableResource($table))->response()->setStatusCode(201);
    }

    public function show(RestaurantTable $table)
    {
        $this->authorize(Permissions::TABLES_VIEW);

        return new TableResource($table);
    }

    public function update(Request $request, RestaurantTable $table)
    {
        $this->authorize(Permissions::TABLES_MANAGE);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:available,occupied,reserved,out_of_service'],
        ]);

        $table->update($data);

        return new TableResource($table);
    }

    public function destroy(RestaurantTable $table)
    {
        $this->authorize(Permissions::TABLES_MANAGE);
        $table->delete();

        return response()->json(['message' => 'Table supprimée.']);
    }
}

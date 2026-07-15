<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use App\Support\Permissions;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::MENU_VIEW);

        $query = MenuItem::with('category');

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($request->boolean('available_only')) {
            $query->available();
        }
        if ($search = $request->query('q')) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        return MenuItemResource::collection(
            $query->orderBy('sort_order')->paginate($request->integer('per_page', 20))
        );
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $data = $this->validated($request);

        return (new MenuItemResource(MenuItem::create($data)))
            ->response()->setStatusCode(201);
    }

    public function show(MenuItem $menuItem)
    {
        $this->authorize(Permissions::MENU_VIEW);

        return new MenuItemResource($menuItem->load('category'));
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $menuItem->update($this->validated($request, false));

        return new MenuItemResource($menuItem);
    }

    public function destroy(MenuItem $menuItem)
    {
        $this->authorize(Permissions::MENU_MANAGE);
        $menuItem->delete();

        return response()->json(['message' => 'Plat supprimé.']);
    }

    private function validated(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'price' => [$required, 'numeric', 'min:0'],
            'menu_id' => ['nullable', 'exists:menus,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'is_available' => ['boolean'],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}

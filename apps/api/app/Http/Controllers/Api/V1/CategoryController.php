<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\Permissions;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::MENU_VIEW);

        return CategoryResource::collection(
            Category::orderBy('sort_order')->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'in:food,drink,dessert,other'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        return (new CategoryResource(Category::create($data)))
            ->response()->setStatusCode(201);
    }

    public function show(Category $category)
    {
        $this->authorize(Permissions::MENU_VIEW);

        return new CategoryResource($category->load('menuItems'));
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:food,drink,dessert,other'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $category->update($data);

        return new CategoryResource($category);
    }

    public function destroy(Category $category)
    {
        $this->authorize(Permissions::MENU_MANAGE);
        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}

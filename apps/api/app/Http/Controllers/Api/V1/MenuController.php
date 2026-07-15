<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Support\Permissions;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::MENU_VIEW);

        return response()->json(['data' => Menu::withCount('items')->get()]);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        return response()->json(['data' => Menu::create($data)], 201);
    }

    public function update(Request $request, Menu $menu)
    {
        $this->authorize(Permissions::MENU_MANAGE);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $menu->update($data);

        return response()->json(['data' => $menu]);
    }

    public function destroy(Menu $menu)
    {
        $this->authorize(Permissions::MENU_MANAGE);
        $menu->delete();

        return response()->json(['message' => 'Menu supprimé.']);
    }
}

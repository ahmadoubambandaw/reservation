<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_id' => $this->menu_id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image' => $this->image,
            'is_available' => (bool) $this->is_available,
            'is_featured' => (bool) $this->is_featured,
            'tags' => $this->tags ?? [],
            'sort_order' => $this->sort_order,
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'birthday' => $this->birthday,
            'visits_count' => $this->visits_count,
            'loyalty_points' => $this->loyalty_points,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
        ];
    }
}

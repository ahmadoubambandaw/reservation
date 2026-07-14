<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => (float) $this->value,
            'min_amount' => $this->min_amount !== null ? (float) $this->min_amount : null,
            'usage_limit' => $this->usage_limit,
            'used_count' => $this->used_count,
            'is_happy_hour' => (bool) $this->is_happy_hour,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'is_active' => (bool) $this->is_active,
        ];
    }
}

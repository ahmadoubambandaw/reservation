<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'guest_name' => $this->guest_name,
            'guest_phone' => $this->guest_phone,
            'guest_email' => $this->guest_email,
            'reserved_at' => $this->reserved_at,
            'party_size' => $this->party_size,
            'status' => $this->status,
            'notes' => $this->notes,
            'table' => new TableResource($this->whenLoaded('table')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'created_at' => $this->created_at,
        ];
    }
}

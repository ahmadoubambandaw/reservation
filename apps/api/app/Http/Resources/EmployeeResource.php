<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_title' => $this->job_title,
            'salary' => $this->salary !== null ? (float) $this->salary : null,
            'status' => $this->status,
            'hired_at' => $this->hired_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'role' => $this->whenLoaded('role', fn () => [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'slug' => $this->role->slug,
            ]),
        ];
    }
}

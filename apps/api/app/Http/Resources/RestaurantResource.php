<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'cover' => $this->cover,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'location' => [
                'lat' => $this->latitude !== null ? (float) $this->latitude : null,
                'lng' => $this->longitude !== null ? (float) $this->longitude : null,
            ],
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'opening_hours' => $this->opening_hours,
            'services' => $this->services ?? [],
            'status' => $this->status,
            'branding' => [
                'theme' => $this->theme,
                'primary_color' => $this->primary_color,
                'secondary_color' => $this->secondary_color,
                'custom_domain' => $this->custom_domain,
            ],
            'subscription' => new SubscriptionResource($this->whenLoaded('subscription')),
            'created_at' => $this->created_at,
        ];
    }
}

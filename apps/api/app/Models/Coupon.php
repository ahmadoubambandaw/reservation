<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'restaurant_id', 'code', 'type', 'value', 'min_amount',
        'usage_limit', 'used_count', 'is_happy_hour',
        'starts_at', 'ends_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_amount' => 'decimal:2',
            'is_happy_hour' => 'boolean',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function isValidNow(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }

    /** Compute the discount amount for a given subtotal. */
    public function discountFor(float $subtotal): float
    {
        if (! $this->isValidNow()) {
            return 0.0;
        }
        if ($this->min_amount !== null && $subtotal < (float) $this->min_amount) {
            return 0.0;
        }

        $discount = $this->type === 'percentage'
            ? $subtotal * ((float) $this->value / 100)
            : (float) $this->value;

        return round(min($discount, $subtotal), 2);
    }
}

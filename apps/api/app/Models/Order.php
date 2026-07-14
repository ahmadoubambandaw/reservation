<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'restaurant_id', 'customer_id', 'table_id', 'employee_id', 'coupon_id',
        'code', 'type', 'status', 'payment_status',
        'subtotal', 'tax', 'discount', 'total', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->code)) {
                $order->code = 'ORD-'.strtoupper(Str::random(8));
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    /** Recompute money columns from line items + optional coupon. */
    public function recalculate(float $taxRate = 0.0): void
    {
        $this->subtotal = $this->items->sum('total');
        $this->tax = round($this->subtotal * $taxRate, 2);

        $discount = 0.0;
        if ($this->coupon) {
            $discount = $this->coupon->discountFor((float) $this->subtotal);
        }
        $this->discount = $discount;
        $this->total = max(0, $this->subtotal + $this->tax - $discount);
    }
}

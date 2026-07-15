<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Reservation extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'restaurant_id', 'customer_id', 'table_id', 'code',
        'guest_name', 'guest_phone', 'guest_email',
        'reserved_at', 'party_size', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return ['reserved_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Reservation $reservation) {
            if (empty($reservation->code)) {
                $reservation->code = 'RSV-'.strtoupper(Str::random(8));
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('reserved_at', '>=', now())
            ->whereIn('status', ['pending', 'confirmed']);
    }
}

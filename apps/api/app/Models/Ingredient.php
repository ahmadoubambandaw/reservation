<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id', 'supplier_id', 'name', 'unit',
        'stock_quantity', 'reorder_level', 'cost_per_unit', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stock_quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'cost_per_unit' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isLow(): bool
    {
        return (float) $this->stock_quantity <= (float) $this->reorder_level;
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'reorder_level');
    }

    /** Apply a signed delta to the stock and record a movement. */
    public function recordMovement(string $type, float $quantity, ?string $reason = null, ?Model $source = null): StockMovement
    {
        $delta = match ($type) {
            'in' => abs($quantity),
            'out' => -abs($quantity),
            default => $quantity, // adjustment: signed
        };

        $this->increment('stock_quantity', $delta);

        return $this->movements()->create([
            'restaurant_id' => $this->restaurant_id,
            'type' => $type,
            'quantity' => $delta,
            'reason' => $reason,
            'source_type' => $source?->getMorphClass(),
            'source_id' => $source?->getKey(),
            'created_at' => now(),
        ]);
    }
}

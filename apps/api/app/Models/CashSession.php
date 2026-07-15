<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashSession extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id', 'opened_by', 'closed_by', 'opening_float',
        'expected_amount', 'counted_amount', 'difference', 'status',
        'notes', 'opened_at', 'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'opening_float' => 'decimal:2',
            'expected_amount' => 'decimal:2',
            'counted_amount' => 'decimal:2',
            'difference' => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'opened_by');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /** Cash collected during this session (succeeded cash payments). */
    public function expectedCash(): float
    {
        return (float) $this->opening_float + (float) $this->payments()
            ->where('method', 'cash')->where('status', 'succeeded')->sum('amount');
    }
}

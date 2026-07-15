<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'restaurant_id', 'name', 'channel', 'audience', 'subject', 'message',
        'status', 'scheduled_at', 'sent_at', 'recipients_count',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }
}

<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use BelongsToTenant;

    protected $fillable = ['restaurant_id', 'key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}

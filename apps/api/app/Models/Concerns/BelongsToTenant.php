<?php

namespace App\Models\Concerns;

use App\Models\Restaurant;
use App\Models\Scopes\TenantScope;
use App\Tenancy\TenantManager;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Apply to any model that is owned by a restaurant (tenant).
 *
 * It does two things:
 *   1. Registers the {@see TenantScope} global scope so reads are filtered
 *      to the active tenant automatically.
 *   2. Auto-fills `restaurant_id` on create from the active tenant, so
 *      application code never has to set it by hand.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (! $model->getAttribute($model->getTenantColumn())) {
                $tenantId = app(TenantManager::class)->id();

                if ($tenantId) {
                    $model->setAttribute($model->getTenantColumn(), $tenantId);
                }
            }
        });
    }

    public function getTenantColumn(): string
    {
        return 'restaurant_id';
    }

    public function getQualifiedTenantColumn(): string
    {
        return $this->getTable().'.'.$this->getTenantColumn();
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /** Query helper to bypass the tenant scope for a single query. */
    public function scopeAcrossTenants($query)
    {
        return $query->withoutGlobalScope(TenantScope::class);
    }
}

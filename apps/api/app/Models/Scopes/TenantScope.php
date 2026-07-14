<?php

namespace App\Models\Scopes;

use App\Tenancy\TenantManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Global scope that constrains every query on a tenant-owned model to the
 * currently active restaurant. This is the single enforcement point that
 * guarantees one restaurant can never read another's rows.
 *
 * The scope is skipped when:
 *   - the caller explicitly spans all tenants (Super Admin / jobs), or
 *   - no tenant is resolved yet (e.g. during registration), in which case
 *     the query is left unfiltered on purpose — callers in that state must
 *     scope manually.
 */
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        /** @var TenantManager $tenant */
        $tenant = app(TenantManager::class);

        if ($tenant->spansAllTenants() || ! $tenant->check()) {
            return;
        }

        $builder->where(
            $model->getQualifiedTenantColumn(),
            $tenant->id()
        );
    }
}

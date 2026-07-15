<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Permissions from the central catalogue.
        foreach (Permissions::catalogue() as $group => $items) {
            foreach ($items as $slug => $label) {
                Permission::updateOrCreate(
                    ['slug' => $slug],
                    ['name' => $label, 'group' => $group],
                );
            }
        }

        // 2. System roles.
        $roles = [
            Role::SUPER_ADMIN => 'Super Administrateur',
            Role::OWNER => 'Propriétaire',
            Role::MANAGER => 'Manager',
            Role::CASHIER => 'Caissier',
            Role::WAITER => 'Serveur',
            Role::KITCHEN => 'Cuisine',
            Role::CUSTOMER => 'Client',
        ];

        foreach ($roles as $slug => $name) {
            Role::updateOrCreate(['slug' => $slug], ['name' => $name, 'is_system' => true]);
        }

        // 3. Attach default permissions per role.
        $permissionsBySlug = Permission::pluck('id', 'slug');

        foreach (Permissions::forRoles() as $roleSlug => $slugs) {
            $role = Role::where('slug', $roleSlug)->first();
            if (! $role) {
                continue;
            }
            $ids = collect($slugs)->map(fn ($s) => $permissionsBySlug[$s] ?? null)->filter()->all();
            $role->permissions()->sync($ids);
        }
    }
}

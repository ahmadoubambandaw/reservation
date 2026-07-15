<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::EMPLOYEES_VIEW);

        return EmployeeResource::collection(
            Employee::with(['user', 'role'])->latest()->get()
        );
    }

    /**
     * Add a staff member: creates a login account if the email is new,
     * otherwise attaches the existing user, then assigns a tenant role.
     */
    public function store(Request $request, TenantManager $tenant)
    {
        $this->authorize(Permissions::EMPLOYEES_MANAGE);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in([Role::MANAGER, Role::CASHIER, Role::WAITER, Role::KITCHEN])],
            'job_title' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        $role = Role::where('slug', $data['role'])->firstOrFail();

        $employee = DB::transaction(function () use ($data, $role, $tenant) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => $data['password'] ?? str()->random(16)],
            );

            abort_if(
                Employee::where('restaurant_id', $tenant->id())->where('user_id', $user->id)->exists(),
                422,
                'Cet utilisateur fait déjà partie du personnel.'
            );

            return Employee::create([
                'restaurant_id' => $tenant->id(),
                'user_id' => $user->id,
                'role_id' => $role->id,
                'job_title' => $data['job_title'] ?? null,
                'salary' => $data['salary'] ?? null,
                'status' => 'active',
                'hired_at' => now(),
            ]);
        });

        return (new EmployeeResource($employee->load(['user', 'role'])))
            ->response()->setStatusCode(201);
    }

    public function update(Request $request, Employee $employee)
    {
        $this->authorize(Permissions::EMPLOYEES_MANAGE);

        $data = $request->validate([
            'role' => ['sometimes', Rule::in([Role::MANAGER, Role::CASHIER, Role::WAITER, Role::KITCHEN])],
            'job_title' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (isset($data['role'])) {
            $employee->role_id = Role::where('slug', $data['role'])->firstOrFail()->id;
            unset($data['role']);
        }

        $employee->fill($data)->save();

        return new EmployeeResource($employee->load(['user', 'role']));
    }

    public function destroy(Employee $employee)
    {
        $this->authorize(Permissions::EMPLOYEES_MANAGE);

        abort_if(
            $employee->role->slug === Role::OWNER,
            422,
            'Le propriétaire ne peut pas être retiré.'
        );

        $employee->delete();

        return response()->json(['message' => 'Employé retiré.']);
    }
}

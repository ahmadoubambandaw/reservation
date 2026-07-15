<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Support\Permissions;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::CUSTOMERS_VIEW);

        $query = Customer::query();
        if ($search = $request->query('q')) {
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('phone', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%"));
        }

        return CustomerResource::collection(
            $query->latest()->paginate($request->integer('per_page', 20))
        );
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::CUSTOMERS_MANAGE);

        return (new CustomerResource(Customer::create($this->rules($request))))
            ->response()->setStatusCode(201);
    }

    public function show(Customer $customer)
    {
        $this->authorize(Permissions::CUSTOMERS_VIEW);

        return new CustomerResource($customer);
    }

    public function update(Request $request, Customer $customer)
    {
        $this->authorize(Permissions::CUSTOMERS_MANAGE);
        $customer->update($this->rules($request, false));

        return new CustomerResource($customer);
    }

    public function destroy(Customer $customer)
    {
        $this->authorize(Permissions::CUSTOMERS_MANAGE);
        $customer->delete();

        return response()->json(['message' => 'Client supprimé.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'birthday' => ['nullable', 'date'],
            'loyalty_points' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}

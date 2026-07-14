<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Restaurant;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::RESERVATIONS_VIEW);

        $query = Reservation::with(['table', 'customer']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($date = $request->query('date')) {
            $query->whereDate('reserved_at', $date);
        }
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        return ReservationResource::collection(
            $query->orderBy('reserved_at')->paginate($request->integer('per_page', 20))
        );
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::RESERVATIONS_MANAGE);

        $data = $this->rules($request);
        $reservation = Reservation::create($data);

        return (new ReservationResource($reservation->load('table')))
            ->response()->setStatusCode(201);
    }

    public function show(Reservation $reservation)
    {
        $this->authorize(Permissions::RESERVATIONS_VIEW);

        return new ReservationResource($reservation->load(['table', 'customer']));
    }

    public function update(Request $request, Reservation $reservation)
    {
        $this->authorize(Permissions::RESERVATIONS_MANAGE);

        $reservation->update($this->rules($request, false));

        return new ReservationResource($reservation->load('table'));
    }

    public function destroy(Reservation $reservation)
    {
        $this->authorize(Permissions::RESERVATIONS_MANAGE);
        $reservation->delete();

        return response()->json(['message' => 'Réservation supprimée.']);
    }

    /**
     * Public, unauthenticated guest booking for a given restaurant.
     * Runs in an explicit tenant context so the reservation is attributed
     * to the right restaurant.
     */
    public function publicStore(Request $request, Restaurant $restaurant, TenantManager $tenant)
    {
        abort_unless($restaurant->status === 'active', 404);

        $data = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:40'],
            'guest_email' => ['nullable', 'email'],
            'reserved_at' => ['required', 'date', 'after:now'],
            'party_size' => ['required', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $reservation = $tenant->forRestaurant($restaurant, fn () => Reservation::create([
            ...$data,
            'restaurant_id' => $restaurant->id,
            'status' => 'pending',
        ]));

        return (new ReservationResource($reservation))
            ->response()->setStatusCode(201);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'reserved_at' => [$required, 'date'],
            'party_size' => [$required, 'integer', 'min:1', 'max:100'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'guest_name' => ['nullable', 'string', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:40'],
            'guest_email' => ['nullable', 'email'],
            'status' => ['sometimes', 'in:pending,confirmed,seated,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}

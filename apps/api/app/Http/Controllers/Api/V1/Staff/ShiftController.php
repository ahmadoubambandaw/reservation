<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Support\Permissions;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::STAFF_VIEW);

        $query = Shift::with('employee.user');
        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }
        if ($from = $request->date('from')) {
            $query->where('starts_at', '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->where('starts_at', '<=', $to);
        }

        return response()->json(['data' => $query->orderBy('starts_at')->get()]);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::STAFF_MANAGE);

        return response()->json(['data' => Shift::create($this->rules($request))], 201);
    }

    public function update(Request $request, Shift $shift)
    {
        $this->authorize(Permissions::STAFF_MANAGE);
        $shift->update($this->rules($request, false));

        return response()->json(['data' => $shift]);
    }

    public function destroy(Shift $shift)
    {
        $this->authorize(Permissions::STAFF_MANAGE);
        $shift->delete();

        return response()->json(['message' => 'Créneau supprimé.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'employee_id' => [$required, 'exists:employees,id'],
            'starts_at' => [$required, 'date'],
            'ends_at' => [$required, 'date', 'after:starts_at'],
            'role_label' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}

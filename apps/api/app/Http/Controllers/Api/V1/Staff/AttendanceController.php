<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Support\Permissions;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::STAFF_VIEW);

        $query = Attendance::with('employee.user');
        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }
        if ($date = $request->date('date')) {
            $query->whereDate('work_date', $date);
        }

        return $query->latest('work_date')->paginate(30);
    }

    /** Clock the current user in (creates today's open attendance row). */
    public function clockIn(Request $request)
    {
        $this->authorize(Permissions::STAFF_VIEW);

        $employee = $request->user()->employeeFor();
        abort_unless($employee, 422, 'Aucun profil employé pour cet utilisateur.');

        $attendance = Attendance::firstOrCreate(
            ['employee_id' => $employee->id, 'work_date' => today(), 'clock_out' => null],
            ['clock_in' => now()],
        );

        return response()->json(['data' => $attendance], 201);
    }

    /** Clock the current user out (closes today's open attendance row). */
    public function clockOut(Request $request)
    {
        $this->authorize(Permissions::STAFF_VIEW);

        $employee = $request->user()->employeeFor();
        abort_unless($employee, 422, 'Aucun profil employé pour cet utilisateur.');

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereNull('clock_out')->latest('clock_in')->first();

        abort_unless($attendance, 422, 'Aucun pointage ouvert.');

        $attendance->update(['clock_out' => now()]);

        return response()->json([
            'data' => $attendance,
            'hours_worked' => $attendance->hoursWorked(),
        ]);
    }
}

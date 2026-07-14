<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Models\CashSession;
use App\Support\Permissions;
use App\Tenancy\TenantManager;
use Illuminate\Http\Request;

class CashSessionController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::POS_OPERATE);

        return response()->json([
            'data' => CashSession::with('openedBy.user')->latest()->paginate(20),
        ]);
    }

    /** The currently open register session, if any. */
    public function current()
    {
        $this->authorize(Permissions::POS_OPERATE);

        $session = CashSession::open()->latest()->first();

        return response()->json(['data' => $session]);
    }

    /** Open the register with a starting float. */
    public function open(Request $request)
    {
        $this->authorize(Permissions::POS_OPERATE);

        abort_if(CashSession::open()->exists(), 422, 'Une caisse est déjà ouverte.');

        $data = $request->validate([
            'opening_float' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $session = CashSession::create([
            'opened_by' => $request->user()->employeeFor()?->id,
            'opening_float' => $data['opening_float'],
            'status' => 'open',
            'notes' => $data['notes'] ?? null,
            'opened_at' => now(),
        ]);

        return response()->json(['data' => $session], 201);
    }

    /** Close the register, reconciling the counted cash against expected. */
    public function close(Request $request, CashSession $cashSession, TenantManager $tenant)
    {
        $this->authorize(Permissions::POS_OPERATE);
        abort_if($cashSession->status === 'closed', 422, 'Cette caisse est déjà clôturée.');

        $data = $request->validate([
            'counted_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $expected = $cashSession->expectedCash();

        $cashSession->update([
            'closed_by' => $request->user()->employeeFor()?->id,
            'expected_amount' => $expected,
            'counted_amount' => $data['counted_amount'],
            'difference' => round($data['counted_amount'] - $expected, 2),
            'status' => 'closed',
            'notes' => $data['notes'] ?? $cashSession->notes,
            'closed_at' => now(),
        ]);

        return response()->json(['data' => $cashSession]);
    }
}

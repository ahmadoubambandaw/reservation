<?php

namespace App\Http\Controllers\Api\V1\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Services\Marketing\CampaignDispatcher;
use App\Support\Permissions;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index()
    {
        $this->authorize(Permissions::MARKETING_MANAGE);

        return response()->json(['data' => Campaign::latest()->paginate(20)]);
    }

    public function store(Request $request)
    {
        $this->authorize(Permissions::MARKETING_MANAGE);

        return response()->json(['data' => Campaign::create($this->rules($request))], 201);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $this->authorize(Permissions::MARKETING_MANAGE);
        abort_if($campaign->status === 'sent', 422, 'Campagne déjà envoyée.');
        $campaign->update($this->rules($request, false));

        return response()->json(['data' => $campaign]);
    }

    public function destroy(Campaign $campaign)
    {
        $this->authorize(Permissions::MARKETING_MANAGE);
        $campaign->delete();

        return response()->json(['message' => 'Campagne supprimée.']);
    }

    /** Preview the resolved audience size without sending. */
    public function audience(Campaign $campaign, CampaignDispatcher $dispatcher)
    {
        $this->authorize(Permissions::MARKETING_MANAGE);

        return response()->json(['recipients' => $dispatcher->audience($campaign)->count()]);
    }

    /** Dispatch the campaign now. */
    public function send(Campaign $campaign, CampaignDispatcher $dispatcher)
    {
        $this->authorize(Permissions::MARKETING_MANAGE);
        abort_if($campaign->status === 'sent', 422, 'Campagne déjà envoyée.');

        $count = $dispatcher->send($campaign);

        return response()->json([
            'message' => "Campagne envoyée à {$count} destinataire(s).",
            'data' => $campaign->fresh(),
        ]);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'channel' => [$required, 'in:sms,email,whatsapp,push'],
            'audience' => ['nullable', 'in:all,loyalty,birthday'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => [$required, 'string'],
            'scheduled_at' => ['nullable', 'date'],
        ]);
    }
}

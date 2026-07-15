<?php

namespace App\Services\Marketing;

use App\Models\Campaign;
use App\Models\Customer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Resolves a campaign's audience and dispatches messages through the
 * configured channel driver. Ships with a `log` driver by default; real
 * providers (Twilio SMS/WhatsApp, an email transport, FCM push) plug in here
 * without touching the controller.
 */
class CampaignDispatcher
{
    public function send(Campaign $campaign): int
    {
        $recipients = $this->audience($campaign);

        foreach ($recipients as $customer) {
            $this->deliver($campaign, $customer);
        }

        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
            'recipients_count' => $recipients->count(),
        ]);

        return $recipients->count();
    }

    /** @return Collection<int, Customer> */
    public function audience(Campaign $campaign): Collection
    {
        $query = Customer::query();

        $query->when($campaign->audience === 'loyalty', fn ($q) => $q->where('loyalty_points', '>', 0));
        $query->when($campaign->audience === 'birthday', fn ($q) => $q
            ->whereNotNull('birthday')
            ->whereRaw("to_char(birthday, 'MM-DD') = ?", [now()->format('m-d')]));

        // Only customers reachable on the chosen channel.
        $query->when(in_array($campaign->channel, ['sms', 'whatsapp']), fn ($q) => $q->whereNotNull('phone'));
        $query->when($campaign->channel === 'email', fn ($q) => $q->whereNotNull('email'));

        return $query->get();
    }

    protected function deliver(Campaign $campaign, Customer $customer): void
    {
        $to = in_array($campaign->channel, ['sms', 'whatsapp']) ? $customer->phone : $customer->email;

        // Default driver: log. Swap on config('services.<provider>') as needed.
        Log::channel(config('logging.default'))->info('campaign.dispatch', [
            'campaign_id' => $campaign->id,
            'channel' => $campaign->channel,
            'to' => $to,
            'subject' => $campaign->subject,
            'message' => $campaign->message,
        ]);
    }
}

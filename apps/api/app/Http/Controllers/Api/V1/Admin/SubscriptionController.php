<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionResource;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::with('plan', 'restaurant');
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return SubscriptionResource::collection(
            $query->latest()->paginate($request->integer('per_page', 20))
        );
    }

    public function update(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'plan_id' => ['sometimes', 'exists:plans,id'],
            'status' => ['sometimes', 'in:trialing,active,past_due,canceled,expired'],
            'ends_at' => ['nullable', 'date'],
        ]);
        $subscription->update($data);

        return new SubscriptionResource($subscription->load('plan'));
    }
}

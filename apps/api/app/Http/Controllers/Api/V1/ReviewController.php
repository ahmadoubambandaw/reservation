<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Support\Permissions;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize(Permissions::REVIEWS_MANAGE);

        $query = Review::with('customer');
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return ReviewResource::collection($query->latest()->paginate(20));
    }

    public function update(Request $request, Review $review)
    {
        $this->authorize(Permissions::REVIEWS_MANAGE);

        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);
        $review->update($data);

        return new ReviewResource($review);
    }

    public function destroy(Review $review)
    {
        $this->authorize(Permissions::REVIEWS_MANAGE);
        $review->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}

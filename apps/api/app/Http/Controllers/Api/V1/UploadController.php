<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use App\Tenancy\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(
        protected CloudinaryService $cloudinary,
        protected TenantManager $tenant,
    ) {}

    /** Upload an image (logo, cover, dish photo) for the current restaurant. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'image', 'max:5120'], // 5 MB
            'type' => ['nullable', 'in:logo,cover,menu,general'],
        ]);

        $folder = 'ndaw-resto/'.($this->tenant->id() ?? 'shared').'/'.($data['type'] ?? 'general');

        $result = $this->cloudinary->upload($request->file('file'), $folder);

        return response()->json([
            'url' => $result['url'],
            'public_id' => $result['public_id'],
            'provider' => $result['provider'],
        ], 201);
    }
}

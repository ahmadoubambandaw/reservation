<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Uploads images to Cloudinary using a signed server-side upload. When
 * Cloudinary credentials are not configured, it transparently falls back to
 * the local `public` disk so uploads work out of the box in dev / demo.
 */
class CloudinaryService
{
    public function isConfigured(): bool
    {
        return filled(config('services.cloudinary.cloud_name'))
            && filled(config('services.cloudinary.api_key'))
            && filled(config('services.cloudinary.api_secret'));
    }

    public function provider(): string
    {
        return $this->isConfigured() ? 'cloudinary' : 'local';
    }

    /**
     * @return array{url: string, public_id: string, provider: string}
     */
    public function upload(UploadedFile $file, string $folder): array
    {
        return $this->isConfigured()
            ? $this->uploadToCloudinary($file, $folder)
            : $this->uploadLocally($file, $folder);
    }

    protected function uploadToCloudinary(UploadedFile $file, string $folder): array
    {
        $cloud = config('services.cloudinary.cloud_name');
        $apiKey = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');
        $timestamp = time();

        // Signature is sha1 of the alphabetically-sorted params + the secret.
        $signature = sha1("folder={$folder}&timestamp={$timestamp}{$apiSecret}");

        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName() ?: 'upload',
        )->post("https://api.cloudinary.com/v1_1/{$cloud}/image/upload", [
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'folder' => $folder,
            'signature' => $signature,
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Échec du téléversement Cloudinary : '.$response->body());
        }

        return [
            'url' => $response->json('secure_url'),
            'public_id' => $response->json('public_id'),
            'provider' => 'cloudinary',
        ];
    }

    protected function uploadLocally(UploadedFile $file, string $folder): array
    {
        $name = Str::random(24).'.'.($file->getClientOriginalExtension() ?: 'png');
        $path = trim($folder, '/').'/'.$name;

        Storage::disk('public')->put($path, file_get_contents($file->getRealPath()));

        // The public disk may already return an absolute URL (when its `url`
        // is configured); otherwise, make it absolute against APP_URL.
        $url = Storage::disk('public')->url($path);
        if (! str_starts_with($url, 'http')) {
            $url = rtrim((string) config('app.url'), '/').'/'.ltrim($url, '/');
        }

        return [
            'url' => $url,
            'public_id' => $path,
            'provider' => 'local',
        ];
    }
}

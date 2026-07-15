<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedReferenceData();
    }

    public function test_authenticated_user_can_upload_an_image_locally(): void
    {
        Storage::fake('public');
        [$restaurant, $owner] = $this->makeRestaurant();

        $response = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/uploads', [
            'file' => UploadedFile::fake()->image('logo.png', 200, 200),
            'type' => 'logo',
        ]);

        $response->assertCreated()
            ->assertJsonPath('provider', 'local')
            ->assertJsonStructure(['url', 'public_id']);

        Storage::disk('public')->assertExists($response->json('public_id'));
        $this->assertStringContainsString("ndaw-resto/{$restaurant->id}/logo", $response->json('public_id'));
    }

    public function test_upload_rejects_non_images(): void
    {
        [$restaurant, $owner] = $this->makeRestaurant();

        $this->actingAs($owner, 'sanctum')->postJson('/api/v1/uploads', [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertStatus(422);
    }

    public function test_upload_requires_authentication(): void
    {
        $this->postJson('/api/v1/uploads', [
            'file' => UploadedFile::fake()->image('x.png'),
        ])->assertUnauthorized();
    }
}

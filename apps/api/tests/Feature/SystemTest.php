<?php

namespace Tests\Feature;

use Tests\TestCase;

class SystemTest extends TestCase
{
    public function test_setup_is_disabled_without_a_token(): void
    {
        config(['app.setup_token' => null]);

        $this->postJson('/api/v1/system/setup')->assertNotFound();
    }

    public function test_setup_rejects_a_wrong_token(): void
    {
        config(['app.setup_token' => 'secret-token']);

        $this->postJson('/api/v1/system/setup', [], ['X-Setup-Token' => 'nope'])
            ->assertForbidden();
    }
}

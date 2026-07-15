<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * One-time provisioning for serverless hosts (Vercel) that have no release
 * phase to run migrations. Guarded by a secret SETUP_TOKEN; unset the token
 * after setup to disable the endpoint entirely.
 */
class SystemController extends Controller
{
    public function setup(Request $request): JsonResponse
    {
        $token = config('app.setup_token');

        // Token may be provided via header (POST) or query string (GET trigger).
        $provided = $request->header('X-Setup-Token') ?? $request->query('token', '');

        abort_if(blank($token), 404);
        abort_unless(
            hash_equals((string) $token, (string) $provided),
            403,
            'Jeton de configuration invalide.',
        );

        // Ensure the dedicated schema exists before migrating into it.
        $schema = config('database.connections.pgsql.search_path');
        if ($schema && $schema !== 'public') {
            DB::statement('CREATE SCHEMA IF NOT EXISTS "'.str_replace('"', '', $schema).'"');
        }

        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();

        if ($request->boolean('seed')) {
            Artisan::call('db:seed', ['--force' => true]);
            $output .= Artisan::output();
        }

        return response()->json([
            'ok' => true,
            'schema' => $schema,
            'output' => $output,
        ]);
    }
}

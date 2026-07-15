<?php

/**
 * Serverless entry point for Vercel (vercel-php runtime).
 *
 * This file lives at the project root — NOT under api/ — because Vercel reserves
 * the /api/* URL space for functions in an api/ directory and strips the /api
 * prefix before invoking them. Since the Laravel app serves its routes under
 * /api/v1/*, an api/ entry made every API route 404. A root entry keeps the
 * original REQUEST_URI intact.
 *
 * The vercel-php builder installs Composer with --no-scripts, so package:discover
 * never runs and bootstrap/cache is absent on the read-only lambda filesystem.
 * Point every cache/compiled path at /tmp (the only writable dir) so Laravel
 * rebuilds its manifests on demand. No extra env vars required.
 */
$tmp = sys_get_temp_dir(); // "/tmp" on Vercel

foreach ([
    'APP_SERVICES_CACHE' => $tmp.'/laravel-services.php',
    'APP_PACKAGES_CACHE' => $tmp.'/laravel-packages.php',
    'APP_CONFIG_CACHE' => $tmp.'/laravel-config.php',
    'APP_ROUTES_CACHE' => $tmp.'/laravel-routes.php',
    'APP_EVENTS_CACHE' => $tmp.'/laravel-events.php',
    'VIEW_COMPILED_PATH' => $tmp,
] as $key => $value) {
    if (getenv($key) === false && ! isset($_ENV[$key]) && ! isset($_SERVER[$key])) {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

require __DIR__.'/public/index.php';

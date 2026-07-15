<?php

/**
 * Serverless entry point for Vercel (vercel-php runtime).
 *
 * The vercel-php builder installs Composer dependencies with --no-scripts, so
 * `artisan package:discover` never runs and bootstrap/cache/{services,packages}.php
 * are absent from the bundle. The lambda filesystem is read-only except /tmp, so
 * Laravel cannot regenerate them in bootstrap/cache and boots with no service
 * providers (symptom: "Target class [view] does not exist" on every route).
 *
 * Fix: point every cache/compiled path at /tmp before Laravel boots, so the
 * framework builds its manifests there on demand. No extra env vars required.
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
    // Only set when the host has not provided an explicit value.
    if (getenv($key) === false && ! isset($_ENV[$key]) && ! isset($_SERVER[$key])) {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

require __DIR__.'/../public/index.php';

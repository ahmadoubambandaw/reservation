<?php

/**
 * Serverless entry point for Vercel (vercel-php runtime).
 * Delegates to Laravel's standard front controller. __DIR__ inside the
 * included file remains `public/`, so all relative paths resolve correctly.
 */

// Deploy marker: root directory set to apps/api on Vercel.
require __DIR__.'/../public/index.php';

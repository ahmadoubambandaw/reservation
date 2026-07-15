<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Ndaw-Resto API',
        'status' => 'ok',
        'docs' => '/api/v1',
    ]);
});

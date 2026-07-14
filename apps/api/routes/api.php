<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\MenuItemController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\Public\PlanController;
use App\Http\Controllers\Api\V1\Public\RestaurantController as PublicRestaurantController;
use App\Http\Controllers\Api\V1\ReservationController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\StatsController;
use App\Http\Controllers\Api\V1\TableController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // -------------------------------------------------------------
    // Public (no auth)
    // -------------------------------------------------------------
    Route::get('plans', [PlanController::class, 'index']);
    Route::get('restaurants', [PublicRestaurantController::class, 'index']);
    Route::get('restaurants/{restaurant}', [PublicRestaurantController::class, 'show']);
    Route::get('restaurants/{restaurant}/menu', [PublicRestaurantController::class, 'menu']);
    Route::get('restaurants/{restaurant}/reviews', [PublicRestaurantController::class, 'reviews']);
    Route::post('restaurants/{restaurant}/reservations', [ReservationController::class, 'publicStore']);

    // -------------------------------------------------------------
    // Auth
    // -------------------------------------------------------------
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    // -------------------------------------------------------------
    // Authenticated workspace (tenant resolved after auth)
    // -------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::post('auth/2fa/enable', [AuthController::class, 'enableTwoFactor']);
        Route::post('auth/2fa/confirm', [AuthController::class, 'confirmTwoFactor']);
        Route::delete('auth/2fa', [AuthController::class, 'disableTwoFactor']);

        // Restaurant workspace
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('stats/overview', [StatsController::class, 'overview']);

        Route::apiResource('tables', TableController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('menus', MenuController::class)->except('show');
        Route::apiResource('menu-items', MenuItemController::class);
        Route::apiResource('reservations', ReservationController::class);
        Route::apiResource('orders', OrderController::class);
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('employees', EmployeeController::class)->except('show');
        Route::apiResource('coupons', CouponController::class)->except('show');
        Route::apiResource('reviews', ReviewController::class)->only(['index', 'update', 'destroy']);

        // ---------------------------------------------------------
        // Super Admin (platform-wide)
        // ---------------------------------------------------------
        Route::prefix('admin')->middleware('role:super_admin')->group(function () {
            Route::get('stats', [Admin\StatsController::class, 'index']);
            Route::apiResource('restaurants', Admin\RestaurantController::class)->except('store');
            Route::apiResource('subscriptions', Admin\SubscriptionController::class)->only(['index', 'update']);
            Route::apiResource('users', Admin\UserController::class)->only(['index', 'show']);
        });
    });
});

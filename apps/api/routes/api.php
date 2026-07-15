<?php

use App\Http\Controllers\Api\V1\Accounting;
use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\Inventory;
use App\Http\Controllers\Api\V1\Kitchen;
use App\Http\Controllers\Api\V1\Marketing;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\MenuItemController;
use App\Http\Controllers\Api\V1\ModuleController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\Pos;
use App\Http\Controllers\Api\V1\Public\PlanController;
use App\Http\Controllers\Api\V1\Public\RestaurantController as PublicRestaurantController;
use App\Http\Controllers\Api\V1\Public\SiteController;
use App\Http\Controllers\Api\V1\Reports;
use App\Http\Controllers\Api\V1\ReservationController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\Settings;
use App\Http\Controllers\Api\V1\Staff;
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

    // Per-restaurant public website (ecosystem storefront)
    Route::get('sites/resolve', [SiteController::class, 'resolve']);
    Route::get('sites/{restaurant}', [SiteController::class, 'show']);

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
        Route::get('modules', [ModuleController::class, 'index']);

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

        // =========================================================
        // Restaurant OS modules (gated by subscription plan)
        // =========================================================

        // --- POS / caisse ---
        Route::middleware('module:pos')->group(function () {
            Route::get('pos/sessions', [Pos\CashSessionController::class, 'index']);
            Route::get('pos/sessions/current', [Pos\CashSessionController::class, 'current']);
            Route::post('pos/sessions', [Pos\CashSessionController::class, 'open']);
            Route::post('pos/sessions/{cashSession}/close', [Pos\CashSessionController::class, 'close']);
            Route::get('orders/{order}/payments', [Pos\PaymentController::class, 'index']);
            Route::post('orders/{order}/payments', [Pos\PaymentController::class, 'store']);
            Route::get('orders/{order}/ticket', [OrderController::class, 'ticket']);
        });

        // --- Kitchen Display ---
        Route::middleware('module:kitchen_display')->group(function () {
            Route::get('kitchen/queue', [Kitchen\KitchenDisplayController::class, 'queue']);
            Route::patch('kitchen/items/{orderItem}', [Kitchen\KitchenDisplayController::class, 'updateItem']);
            Route::post('kitchen/orders/{order}/bump', [Kitchen\KitchenDisplayController::class, 'bump']);
        });

        // --- Inventory / stocks ---
        Route::middleware('module:inventory')->group(function () {
            Route::apiResource('suppliers', Inventory\SupplierController::class)->except('show');
            Route::get('ingredients/alerts', [Inventory\IngredientController::class, 'alerts']);
            Route::post('ingredients/{ingredient}/adjust', [Inventory\IngredientController::class, 'adjust']);
            Route::apiResource('ingredients', Inventory\IngredientController::class)->except('show');
            Route::get('purchases', [Inventory\PurchaseController::class, 'index']);
            Route::post('purchases', [Inventory\PurchaseController::class, 'store']);
            Route::post('purchases/{purchase}/receive', [Inventory\PurchaseController::class, 'receive']);
        });

        // --- Accounting ---
        Route::middleware('module:accounting')->group(function () {
            Route::get('accounting/summary', [Accounting\AccountingController::class, 'summary']);
            Route::apiResource('expenses', Accounting\ExpenseController::class)->except('show');
        });

        // --- Staff (schedules + attendance) ---
        Route::middleware('module:staff')->group(function () {
            Route::apiResource('shifts', Staff\ShiftController::class)->except('show');
            Route::get('attendances', [Staff\AttendanceController::class, 'index']);
            Route::post('attendances/clock-in', [Staff\AttendanceController::class, 'clockIn']);
            Route::post('attendances/clock-out', [Staff\AttendanceController::class, 'clockOut']);
        });

        // --- Marketing ---
        Route::middleware('module:marketing')->group(function () {
            Route::apiResource('campaigns', Marketing\CampaignController::class)->except('show');
            Route::get('campaigns/{campaign}/audience', [Marketing\CampaignController::class, 'audience']);
            Route::post('campaigns/{campaign}/send', [Marketing\CampaignController::class, 'send']);
        });

        // --- Reports ---
        Route::middleware('module:reports')->prefix('reports')->group(function () {
            Route::get('sales', [Reports\ReportController::class, 'sales']);
            Route::get('reservations', [Reports\ReportController::class, 'reservations']);
            Route::get('popular-dishes', [Reports\ReportController::class, 'popularDishes']);
            Route::get('employees', [Reports\ReportController::class, 'employees']);
        });

        // --- Settings / branding ---
        Route::middleware('module:settings')->group(function () {
            Route::get('settings/branding', [Settings\SettingsController::class, 'show']);
            Route::put('settings/branding', [Settings\SettingsController::class, 'update']);
        });

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

<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GameController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;
use App\Http\Controllers\EssimController;
use App\Http\Controllers\MidtransWebhookController;



Route::post('midtrans/webhook', [MidtransWebhookController::class, 'handle']);


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/order/{game:slug}', [OrderController::class, 'show'])->name('order.show');
Route::post('/order/process', [OrderController::class, 'process'])->name('order.process');
Route::get('/invoice/{invoice_number}', [OrderController::class, 'invoice'])->name('invoice.show');


require __DIR__.'/auth.php';


Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // --- PINDAHKAN ROUTE SYNC KE SINI (PALING ATAS) ---
    Route::get('/integrations/sync-vip', [GameController::class, 'showSyncPage'])->name('games.sync-page');
    Route::post('/integrations/sync-vip', [GameController::class, 'processSync'])->name('games.sync-process');
    
    // --- BARU ROUTE RESOURCE DI BAWAHNYA ---
    Route::resource('games', GameController::class);
    
    Route::resource('items', ItemController::class);
    Route::patch('items/{item}/toggle-status', [ItemController::class, 'toggleStatus'])->name('items.toggle-status');
});

Route::post('/order/check-id', [OrderController::class, 'checkGameId'])->name('order.check-id');

// routes/web.php
Route::get('/test-csrf', function() {
    $middleware = app(\App\Http\Middleware\VerifyCsrfToken::class);
    $reflection = new ReflectionClass($middleware);
    $property = $reflection->getProperty('except');
    $property->setAccessible(true);
    
    return response()->json([
        'except' => $property->getValue($middleware)
    ]);
});

Route::get('/cek-transaksi', [OrderController::class, 'checkTransaction'])->name('transaction.check');
Route::post('/cek-transaksi', [OrderController::class, 'processCheckTransaction'])->name('transaction.process');


// eSIM Routes
Route::prefix('essim')->name('essim.')->group(function () {
    // Public routes
    Route::get('/', [EssimController::class, 'index'])->name('index');
    Route::get('/packages/{packageCode}', [EssimController::class, 'showPackage'])->name('showPackage');
    Route::post('/order', [EssimController::class, 'processOrder'])->name('order');
    Route::get('/invoice/{invoice_number}', [EssimController::class, 'invoice'])->name('invoice');
    
    // Check transaction
    Route::get('/check', function () {
        return inertia('Essim/Check');
    })->name('check');
    Route::post('/check', [EssimController::class, 'checkTransaction'])->name('check.process');
    
    // Protected routes (require auth)
    Route::middleware('auth')->group(function () {
        Route::get('/my-esims', [EssimController::class, 'myEsims'])->name('my-esims');
        Route::get('/details/{id}', [EssimController::class, 'esimDetails'])->name('details');
    });
});

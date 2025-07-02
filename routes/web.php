<?php

use App\Http\Controllers\DoorprizeController;
use App\Http\Controllers\DoorprizeEventController;
use App\Http\Controllers\PrizeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Doorprize Events CRUD
    Route::resource('events', DoorprizeEventController::class);
    Route::post('events/{event}/set-active', [DoorprizeEventController::class, 'setActive'])->name('events.set-active');
    Route::post('events/{event}/set-completed', [DoorprizeEventController::class, 'setCompleted'])->name('events.set-completed');

    // Prizes CRUD
    Route::resource('prizes', PrizeController::class);
    Route::post('prizes/{prize}/toggle-active', [PrizeController::class, 'toggleActive'])->name('prizes.toggle-active');
    Route::post('prizes/sort-order', [PrizeController::class, 'updateSortOrder'])->name('prizes.sort-order');


    Route::resource('doorprize', DoorprizeController::class)->only(['index', 'draw', 'getAvailableEmployees', 'reset', 'getPrizeWinners', 'getAllWinners']);
    // API routes untuk doorprize
    Route::prefix('doorprize')->name('doorprize.')->group(function () {

        // Main doorprize page
        Route::get('/doorprize', [DoorprizeController::class, 'index'])->name('doorprize.index');

        // Draw a winner
        Route::post('/draw', [DoorprizeController::class, 'draw'])->name('draw');

        // Get available employees for a specific prize
        Route::get('/available-employees', [DoorprizeController::class, 'getAvailableEmployees'])->name('available-employees');

        // Test get
        Route::get('/available-em', [DoorprizeController::class, 'get'])->name('available-em');

        // Get winners for specific prize
        Route::get('/prize-winners', [DoorprizeController::class, 'getPrizeWinners'])->name('prize-winners');

        // Get all winners
        Route::get('/winners', [DoorprizeController::class, 'getAllWinners'])->name('winners');

        // Reset event
        Route::post('/reset', [DoorprizeController::class, 'reset'])->name('reset');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

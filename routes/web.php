<?php

use App\Http\Controllers\DoorprizeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//Route::get('/', function () {
//    return Inertia::render('doorprize');
//})->name('home');

// Main doorprize page
Route::get('/doorprize', [DoorprizeController::class, 'index'])->name('doorprize.index');

// API routes untuk doorprize
Route::prefix('doorprize')->name('doorprize.')->group(function () {

    // Draw a winner
    Route::post('/draw', [DoorprizeController::class, 'draw'])->name('draw');

    // Get available employees for a specific prize
    Route::get('/available-employees', [DoorprizeController::class, 'getAvailableEmployees'])->name('available-employees');

    // Get winners for specific prize
    Route::get('/prize-winners', [DoorprizeController::class, 'getPrizeWinners'])->name('prize-winners');

    // Get all winners
    Route::get('/winners', [DoorprizeController::class, 'getAllWinners'])->name('winners');

    // Reset event
    Route::post('/reset', [DoorprizeController::class, 'reset'])->name('reset');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

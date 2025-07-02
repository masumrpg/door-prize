<?php

use App\Http\Controllers\DoorprizeController;
use App\Http\Controllers\PrizeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Main doorprize page
Route::get('/doorprize', [DoorprizeController::class, 'index'])->name('doorprize.index');

// API routes untuk doorprize
Route::prefix('doorprize')->name('doorprize.')->group(function () {

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

// Prize routes
Route::resource('prizes', PrizeController::class);

// Additional prize routes
Route::patch('prizes/{prize}/toggle-status', [PrizeController::class, 'toggleStatus'])
    ->name('prizes.toggle-status');

Route::patch('prizes/{prize}/update-stock', [PrizeController::class, 'updateStock'])
    ->name('prizes.update-stock');

Route::post('prizes/bulk', [PrizeController::class, 'bulk'])
    ->name('prizes.bulk');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('prize', function () {
        $prizes = \App\Models\Prize::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(request('status'), function ($query, $status) {
                $query->where('is_active', $status === 'active');
            })
            ->when(request('stock_status'), function ($query, $stockStatus) {
                if ($stockStatus === 'in_stock') {
                    $query->where('remaining_stock', '>', 0);
                } elseif ($stockStatus === 'out_of_stock') {
                    $query->where('remaining_stock', 0);
                }
            })
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('prize', [
            'prizes' => $prizes,
            'filters' => request()->only(['search', 'status', 'stock_status']),
        ]);
    })->name('prize');

    // Prize management routes in auth area
    Route::prefix('prizes')->name('auth.prizes.')->group(function () {
        Route::get('/', function () {
            $prizes = \App\Models\Prize::query()
                ->when(request('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                ->when(request('status'), function ($query, $status) {
                    $query->where('is_active', $status === 'active');
                })
                ->when(request('stock_status'), function ($query, $stockStatus) {
                    if ($stockStatus === 'in_stock') {
                        $query->where('remaining_stock', '>', 0);
                    } elseif ($stockStatus === 'out_of_stock') {
                        $query->where('remaining_stock', 0);
                    }
                })
                ->orderBy('sort_order')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('prizes/index', [
                'prizes' => $prizes,
                'filters' => request()->only(['search', 'status', 'stock_status']),
            ]);
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('prizes/create');
        })->name('create');

        Route::post('/', [\App\Http\Controllers\PrizeController::class, 'store'])->name('store');

        Route::get('/{prize}/edit', function (\App\Models\Prize $prize) {
            return Inertia::render('prizes/edit', [
                'prize' => $prize
            ]);
        })->name('edit');

        Route::get('/{prize}', function (\App\Models\Prize $prize) {
            return Inertia::render('prizes/show', [
                'prize' => $prize
            ]);
        })->name('show');

        Route::patch('/{prize}', [\App\Http\Controllers\PrizeController::class, 'update'])->name('update');
        Route::delete('/{prize}', [\App\Http\Controllers\PrizeController::class, 'destroy'])->name('destroy');
        Route::patch('/{prize}/toggle-status', [\App\Http\Controllers\PrizeController::class, 'toggleStatus'])->name('toggle-status');
        Route::patch('/{prize}/update-stock', [\App\Http\Controllers\PrizeController::class, 'updateStock'])->name('update-stock');
        Route::post('/bulk', [\App\Http\Controllers\PrizeController::class, 'bulk'])->name('bulk');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

<?php

namespace App\Http\Controllers;

use App\Models\Prize;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PrizeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Prize::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by stock status
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where('remaining_stock', '>', 0);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('remaining_stock', '<=', 0);
            }
        }

        $prizes = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('prizes/index', [
            'prizes' => $prizes,
            'filters' => $request->only(['search', 'status', 'stock_status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('prizes/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7', // hex color
            'total_stock' => 'required|integer|min:0',
            'remaining_stock' => 'required|integer|min:0',
            'estimated_value' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Set remaining_stock to total_stock if not provided
        if (!isset($validated['remaining_stock'])) {
            $validated['remaining_stock'] = $validated['total_stock'];
        }

        // Ensure remaining_stock doesn't exceed total_stock
        if ($validated['remaining_stock'] > $validated['total_stock']) {
            $validated['remaining_stock'] = $validated['total_stock'];
        }

        Prize::create($validated);

        return redirect()->route('auth.prizes.index')
            ->with('success', 'Prize berhasil dibuat.');
    }

    public function show(Prize $prize): Response
    {
        $prize->load(['winners' => function ($query) {
            $query->with('doorprizeEvent')->latest()->take(10);
        }]);

        return Inertia::render('prizes/show', [
            'prize' => $prize,
        ]);
    }

    public function edit(Prize $prize): Response
    {
        return Inertia::render('prizes/edit', [
            'prize' => $prize,
        ]);
    }

    public function update(Request $request, Prize $prize): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7',
            'total_stock' => 'required|integer|min:0',
            'remaining_stock' => 'required|integer|min:0',
            'estimated_value' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Ensure remaining_stock doesn't exceed total_stock
        if ($validated['remaining_stock'] > $validated['total_stock']) {
            $validated['remaining_stock'] = $validated['total_stock'];
        }

        $prize->update($validated);

        return redirect()->route('auth.prizes.index')
            ->with('success', 'Prize berhasil diupdate.');
    }

    public function destroy(Prize $prize): RedirectResponse
    {
        // Check if prize has winners
        if ($prize->winners()->exists()) {
            return redirect()->route('auth.prizes.index')
                ->with('error', 'Prize tidak dapat dihapus karena sudah memiliki pemenang.');
        }

        $prize->delete();

        return redirect()->route('auth.prizes.index')
            ->with('success', 'Prize berhasil dihapus.');
    }

    public function toggleStatus(Prize $prize): RedirectResponse
    {
        $prize->update(['is_active' => !$prize->is_active]);

        $status = $prize->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "Prize berhasil {$status}.");
    }

    public function updateStock(Request $request, Prize $prize): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:increase,decrease,set',
            'amount' => 'required|integer|min:1',
        ]);

        $currentStock = $prize->remaining_stock;

        switch ($validated['action']) {
            case 'increase':
                $newStock = $currentStock + $validated['amount'];
                // Don't exceed total_stock
                $newStock = min($newStock, $prize->total_stock);
                break;
            case 'decrease':
                $newStock = max(0, $currentStock - $validated['amount']);
                break;
            case 'set':
                $newStock = min($validated['amount'], $prize->total_stock);
                break;
        }

        $prize->update(['remaining_stock' => $newStock]);

        return redirect()->back()
            ->with('success', 'Stok prize berhasil diupdate.');
    }

    public function bulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:prizes,id',
        ]);

        $prizes = Prize::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'activate':
                $prizes->update(['is_active' => true]);
                $message = 'Prize terpilih berhasil diaktifkan.';
                break;
            case 'deactivate':
                $prizes->update(['is_active' => false]);
                $message = 'Prize terpilih berhasil dinonaktifkan.';
                break;
            case 'delete':
                // Check if any prize has winners
                $prizesWithWinners = $prizes->whereHas('winners')->count();
                if ($prizesWithWinners > 0) {
                    return redirect()->back()
                        ->with('error', 'Beberapa prize tidak dapat dihapus karena sudah memiliki pemenang.');
                }
                $prizes->delete();
                $message = 'Prize terpilih berhasil dihapus.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}

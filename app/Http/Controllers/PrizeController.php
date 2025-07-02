<?php

namespace App\Http\Controllers;

use App\Models\Prize;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PrizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $prizes = Prize::orderBy('sort_order')->get();
        
        return Inertia::render('prizes/Index', [
            'prizes' => $prizes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('prizes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'color' => 'nullable|string',
            'total_stock' => 'required|integer|min:1',
            'estimated_value' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('prizes', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        // Set remaining stock equal to total stock for new prizes
        $validated['remaining_stock'] = $validated['total_stock'];
        
        // Set default sort order if not provided
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = Prize::max('sort_order') + 1;
        }

        Prize::create($validated);

        return redirect()->route('prizes.index')->with('success', 'Prize created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Prize $prize)
    {
        return Inertia::render('prizes/Show', [
            'prize' => $prize->load('winners.employee')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Prize $prize)
    {
        return Inertia::render('prizes/Edit', [
            'prize' => $prize
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prize $prize)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'color' => 'nullable|string',
            'total_stock' => 'required|integer|min:1',
            'estimated_value' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($prize->image_url) {
                $oldPath = str_replace('/storage/', '', $prize->image_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            
            $path = $request->file('image')->store('prizes', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        // Adjust remaining stock if total stock changes
        if ($prize->total_stock != $validated['total_stock']) {
            $stockDiff = $validated['total_stock'] - $prize->total_stock;
            $validated['remaining_stock'] = $prize->remaining_stock + $stockDiff;
            
            // Ensure remaining stock is not negative
            if ($validated['remaining_stock'] < 0) {
                $validated['remaining_stock'] = 0;
            }
        }

        $prize->update($validated);

        return redirect()->route('prizes.index')->with('success', 'Prize updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prize $prize)
    {
        // Check if prize has winners
        if ($prize->winners()->count() > 0) {
            return redirect()->route('prizes.index')->with('error', 'Cannot delete prize with winners.');
        }
        
        // Delete image if exists
        if ($prize->image_url) {
            $path = str_replace('/storage/', '', $prize->image_url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
        
        $prize->delete();

        return redirect()->route('prizes.index')->with('success', 'Prize deleted successfully.');
    }
    
    /**
     * Toggle prize active status
     */
    public function toggleActive(Prize $prize)
    {
        $prize->update([
            'is_active' => !$prize->is_active
        ]);
        
        $status = $prize->is_active ? 'activated' : 'deactivated';
        
        return redirect()->route('prizes.index')->with('success', "Prize {$status} successfully.");
    }
    
    /**
     * Update prize sort order
     */
    public function updateSortOrder(Request $request)
    {
        $validated = $request->validate([
            'prizes' => 'required|array',
            'prizes.*.id' => 'required|exists:prizes,id',
            'prizes.*.sort_order' => 'required|integer|min:0',
        ]);
        
        foreach ($validated['prizes'] as $prizeData) {
            Prize::where('id', $prizeData['id'])->update([
                'sort_order' => $prizeData['sort_order']
            ]);
        }
        
        return response()->json(['success' => true]);
    }
}
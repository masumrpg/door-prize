<?php

namespace App\Http\Controllers;

use App\Models\DoorprizeEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DoorprizeEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = DoorprizeEvent::orderBy('event_date', 'desc')->get();
        
        return Inertia::render('event/Index', [
            'events' => $events
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('event/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'status' => 'required|in:draft,active,completed',
        ]);

        DoorprizeEvent::create($validated);

        return redirect()->route('events.index')->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(DoorprizeEvent $event)
    {
        return Inertia::render('event/Show', [
            'event' => $event->load('winners.employee', 'winners.prize')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DoorprizeEvent $event)
    {
        return Inertia::render('event/Edit', [
            'event' => $event
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DoorprizeEvent $event)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'status' => 'required|in:draft,active,completed',
        ]);

        $event->update($validated);

        return redirect()->route('events.index')->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DoorprizeEvent $event)
    {
        // Check if event has winners
        if ($event->winners()->count() > 0) {
            return redirect()->route('events.index')->with('error', 'Cannot delete event with winners.');
        }
        
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event deleted successfully.');
    }
    
    /**
     * Set event as active
     */
    public function setActive(DoorprizeEvent $event)
    {
        // Set all events to draft first
        DoorprizeEvent::where('status', 'active')->update(['status' => 'draft']);
        
        // Set this event as active
        $event->update(['status' => 'active']);
        
        return redirect()->route('events.index')->with('success', 'Event set as active.');
    }
    
    /**
     * Set event as completed
     */
    public function setCompleted(DoorprizeEvent $event)
    {
        $event->update(['status' => 'completed']);
        
        return redirect()->route('events.index')->with('success', 'Event marked as completed.');
    }
}
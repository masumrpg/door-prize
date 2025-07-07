<?php

namespace App\Http\Controllers;

use App\Models\DoorprizeEvent;
use App\Models\Employee;
use App\Models\Prize;
use App\Models\Winner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = DoorprizeEvent::active()
        ->get()
        ->map(function ($event) {
            return [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'eventDate' => $event->event_date,
                'status' => $event->status,
            ];
        });

        $currentEventModel = DoorprizeEvent::active()->first();

        if (!$currentEventModel) {
            return Inertia::render('dashboard/error');
        }

        $currentEvent = $currentEventModel ? [
            'id' => $currentEventModel->id,
            'name' => $currentEventModel->name,
            'description' => $currentEventModel->description,
            'eventDate' => $currentEventModel->event_date,
            'status' => $currentEventModel->status,
        ] : null;

        $prizes = Prize::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($prize) {
                return [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'imageUrl' => $prize->image_url,
                    'color' => $prize->color,
                    'stock' => $prize->remaining_stock,
                    'totalStock' => $prize->total_stock,
                ];
            });

        $winners = Winner::with(['employee', 'prize'])
            ->forEvent($currentEventModel)
            ->orderBy('drawn_at', 'desc')
            ->get()
            ->map(function ($winner) {
                return [
                    'id' => $winner->id,
                    'employee' => [
                        'id' => $winner->employee->employee_id,
                        'name' => $winner->employee->name,
                    'employeeId' => $winner->employee->employee_id,
                    ],
                    'prize' => [
                        'id' => $winner->prize->id,
                        'name' => $winner->prize->name,
                        'imageUrl' => $winner->prize->image_url,
                        'color' => $winner->prize->color,
                        'stock' => $winner->prize->remaining_stock,
                        'totalStock' => $winner->prize->total_stock,
                    ],
                    'timestamp' => $winner->timestamp,
                    'winnerNumber' => $winner->winner_number,
                ];
            });

        $totalEmployees = Employee::active()->count();

        // Ambil employee yang sudah menang (unique) untuk event ini
        $totalWinners = Winner::with('employee')
            ->forEvent($currentEventModel)
            ->distinct('employee_id')
            ->count();

        // Ambil daftar employee yang belum menang sama sekali
        $winnerEmployeeIds = Winner::forEvent($currentEventModel)
            ->distinct('employee_id')
            ->pluck('employee_id');

        $availableEmployees = Employee::whereNotIn('id', $winnerEmployeeIds)
            ->active()
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->employee_id,
                    'name' => $employee->name,
                ];
            });

        $availableEmployeesCount = $availableEmployees->count();

        $totalPrizes = Prize::active()->count();

        return Inertia::render('dashboard/index', [
            "currentEvent" => $currentEvent,
            "stats" => [
                "totalEmployees" => $totalEmployees,
                "totalWinners" => $totalWinners,
                "availableCount" => $availableEmployeesCount,
                "totalPrizes" => $totalPrizes,
            ],
            "prizes" => $prizes,
            "recentWinners" => $winners,
            "events" => $events
        ]);
    }
}

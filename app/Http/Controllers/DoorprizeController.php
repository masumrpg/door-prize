<?php

namespace App\Http\Controllers;

use App\Models\DoorprizeEvent;
use App\Models\Employee;
use App\Models\Prize;
use App\Models\Winner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DoorprizeController extends Controller
{
    public function index(): Response
    {
        $currentEvent = DoorprizeEvent::active()->first();

        if (!$currentEvent) {
            return Inertia::render('doorprize/error');
        }

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
            ->forEvent($currentEvent)
            ->orderBy('drawn_at', 'desc')
            ->get()
            ->map(function ($winner) {
                return [
                    'id' => $winner->id,
                    'employee' => [
                        'id' => $winner->employee->employee_id,
                        'name' => $winner->employee->name,
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

        // Ambil semua employee yang aktif
        $totalEmployees = Employee::active()->count();

        // Ambil employee yang sudah menang (unique) untuk event ini
        $totalWinners = Winner::with('employee')
            ->forEvent($currentEvent)
            ->distinct('employee_id')
            ->count();

        // Ambil daftar employee yang belum menang sama sekali
        $winnerEmployeeIds = Winner::forEvent($currentEvent)
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

        return Inertia::render('doorprize/index', [
            'employees' => $availableEmployees,
            'prizes' => $prizes,
            'winners' => $winners,
            'event' => [
                'id' => $currentEvent->id,
                'name' => $currentEvent->name,
                'date' => $currentEvent->event_date->format('Y-m-d'),
            ],
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'totalWinners' => $totalWinners,
                'availableCount' => $totalEmployees - $totalWinners,
            ]
        ]);
    }

    public function draw(Request $request)
    {
        $request->validate([
            'prize_id' => 'required|exists:prizes,id',
            'employee_id' => 'required|string',
        ]);

        $currentEvent = DoorprizeEvent::active()->first();

        if (!$currentEvent) {
            return response()->json(['error' => 'No active event found'], 400);
        }

        $prize = Prize::findOrFail($request->prize_id);
        $employee = Employee::where('employee_id', $request->employee_id)->firstOrFail();

        // Validasi
        if (!$prize->canBeDrawn()) {
            return response()->json(['error' => 'Prize is not available for drawing'], 400);
        }

        if ($employee->hasWonPrize($prize, $currentEvent)) {
            return response()->json(['error' => 'Employee has already won this prize'], 400);
        }

        try {
            DB::beginTransaction();

            // Buat winner baru
            $winner = Winner::create([
                'employee_id' => $employee->id,
                'prize_id' => $prize->id,
                'doorprize_event_id' => $currentEvent->id,
                'winner_number' => Winner::getNextWinnerNumber($prize, $currentEvent),
                'drawn_at' => now(),
                'drawn_by' => 'System',
            ]);

            // Kurangi stock hadiah
            $prize->decrementStock();

            DB::commit();

            // Load relasi untuk response
            $winner->load(['employee', 'prize']);

            return response()->json([
                'success' => true,
                'winner' => [
                    'id' => $winner->id,
                    'employee' => [
                        'id' => $winner->employee->employee_id,
                        'name' => $winner->employee->name,
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
                ],
                'prize' => [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'imageUrl' => $prize->image_url,
                    'color' => $prize->color,
                    'stock' => $prize->remaining_stock,
                    'totalStock' => $prize->total_stock,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create winner'], 500);
        }
    }

    public function getAvailableEmployees(): JsonResponse
    {
        $currentEvent = DoorprizeEvent::active()->first();

        if (!$currentEvent) {
            return response()->json(['error' => 'No active event found'], 400);
        }

        // Ambil semua employee yang aktif
        $totalEmployees = Employee::active()->count();

        // Ambil employee yang sudah menang (unique) untuk event ini
        $totalWinners = Winner::with('employee')
            ->forEvent($currentEvent)
            ->distinct('employee_id')
            ->count();

        // Ambil daftar employee yang belum menang sama sekali
        $winnerEmployeeIds = Winner::forEvent($currentEvent)
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

        return response()->json([
            'employees' => $availableEmployees,
            'totalEmployees' => $totalEmployees,
            'totalWinners' => $totalWinners,
            'availableCount' => $totalEmployees - $totalWinners,
        ]);
    }

    public function reset()
    {
        $currentEvent = DoorprizeEvent::active()->first();

        if (!$currentEvent) {
            return response()->json(['error' => 'No active event found'], 400);
        }

        try {
            DB::beginTransaction();

            // Hapus semua winners untuk event ini
            Winner::forEvent($currentEvent)->delete();

            // Reset stock semua hadiah
            Prize::active()->each(function ($prize) {
                $prize->update(['remaining_stock' => $prize->total_stock]);
            });

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Event reset successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to reset event'], 500);
        }
    }

    public function getPrizeWinners(Request $request)
    {
        $request->validate([
            'prize_id' => 'required|exists:prizes,id',
        ]);

        $currentEvent = DoorprizeEvent::active()->first();
        $prize = Prize::findOrFail($request->prize_id);

        $winners = Winner::with(['employee'])
            ->forEvent($currentEvent)
            ->forPrize($prize)
            ->orderBy('winner_number')
            ->get()
            ->map(function ($winner) use ($prize) {
                return [
                    'id' => $winner->id,
                    'employee' => [
                        'id' => $winner->employee->employee_id,
                        'name' => $winner->employee->name,
                    ],
                    'prize' => [
                        'id' => $prize->id,
                        'name' => $prize->name,
                        'imageUrl' => $prize->image_url,
                        'color' => $prize->color,
                        'stock' => $prize->remaining_stock,
                        'totalStock' => $prize->total_stock,
                    ],
                    'timestamp' => $winner->timestamp,
                    'winnerNumber' => $winner->winner_number,
                ];
            });

        return response()->json([
            'winners' => $winners,
            'prize' => [
                'id' => $prize->id,
                'name' => $prize->name,
                'imageUrl' => $prize->image_url,
                'color' => $prize->color,
                'stock' => $prize->remaining_stock,
                'totalStock' => $prize->total_stock,
            ],
        ]);
    }

    public function getAllWinners()
    {
        $currentEvent = DoorprizeEvent::active()->first();

        if (!$currentEvent) {
            return response()->json(['error' => 'No active event found'], 400);
        }

        $winners = Winner::with(['employee', 'prize'])
            ->forEvent($currentEvent)
            ->orderBy('drawn_at', 'desc')
            ->get()
            ->map(function ($winner) {
                return [
                    'id' => $winner->id,
                    'employee' => [
                        'id' => $winner->employee->employee_id,
                        'name' => $winner->employee->name,
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

        return response()->json([
            'winners' => $winners,
            'prizes' => $prizes,
        ]);
    }
}

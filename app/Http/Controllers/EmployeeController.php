<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search', '');
        $sortBy = $request->get('sortBy', 'name');
        $sortOrder = $request->get('sortOrder', 'asc');
        $perPage = $request->get('perPage', 10);

        // Validate sort parameters
        $allowedSortFields = ['employee_id', 'name', 'department', 'position', 'is_active', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        // Validate per page
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        $employees = Employee::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('employee_id', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('employee/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'perPage' => $perPage,
            ],
        ]);
    }
}

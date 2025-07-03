<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

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

    public function import(Request $request): RedirectResponse
    {
        // Add logging for debugging
        Log::info('Import request received', ['file' => $request->hasFile('file')]);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:2048',
        ]);

        try {
            $file = $request->file('file');

            // Add more logging
            Log::info('Processing file', ['filename' => $file->getClientOriginalName()]);

            $data = Excel::toArray([], $file);

            if (empty($data) || empty($data[0])) {
                return redirect()->back()->with('error', 'File Excel kosong atau tidak valid.');
            }

            $rows = $data[0];
            $header = array_shift($rows); // Ambil header row

            // Normalisasi header (lowercase dan trim)
            $header = array_map(function($h) {
                return strtolower(trim($h));
            }, $header);

            // Cari index kolom berdasarkan urutan: kolom 1 = employee_id, kolom 2 = name
            $employeeIdIndex = 0; // Kolom pertama selalu employee_id
            $nameIndex = 1; // Kolom kedua selalu name

            // Validasi struktur file - harus ada minimal 2 kolom
            if (count($header) < 2) {
                return redirect()->back()->with('error', 'File Excel harus memiliki minimal 2 kolom: Nomor dan Nama.');
            }

            $successCount = 0;
            $updatedCount = 0;
            $errors = [];

            foreach ($rows as $rowIndex => $row) {
                $rowNumber = $rowIndex + 2; // +2 karena array dimulai dari 0 dan header dihapus

                // Skip row kosong
                if (empty(array_filter($row))) {
                    continue;
                }

                $employeeId = isset($row[$employeeIdIndex]) ? trim($row[$employeeIdIndex]) : '';
                $name = isset($row[$nameIndex]) ? trim($row[$nameIndex]) : '';

                // Validasi data - employee_id dan name harus ada
                if (empty($employeeId) || empty($name)) {
                    $errors[] = "Baris {$rowNumber}: Nomor dan Nama tidak boleh kosong.";
                    continue;
                }

                $validator = Validator::make([
                    'employee_id' => $employeeId,
                    'name' => $name,
                ], [
                    'employee_id' => 'required|string|max:255',
                    'name' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNumber}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                try {
                    // Cek apakah employee sudah ada berdasarkan employee_id
                    $existingEmployee = Employee::where('employee_id', $employeeId)->first();

                    if ($existingEmployee) {
                        // Update nama jika employee sudah ada
                        $existingEmployee->update([
                            'name' => $name,
                        ]);
                        $updatedCount++;
                    } else {
                        // Buat employee baru
                        Employee::create([
                            'employee_id' => $employeeId,
                            'name' => $name,
                            'is_active' => true, // Default aktif
                        ]);
                        $successCount++;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Baris {$rowNumber}: Gagal menyimpan data - " . $e->getMessage();
                }
            }

            $message = "Berhasil import {$successCount} karyawan baru";
            if ($updatedCount > 0) {
                $message .= " dan update {$updatedCount} karyawan existing";
            }
            $message .= ".";

            if (!empty($errors)) {
                $message .= " Terdapat " . count($errors) . " error.";
            }

            // Add logging for success
            Log::info('Import completed', [
                'success_count' => $successCount,
                'updated_count' => $updatedCount,
                'errors_count' => count($errors)
            ]);

            return redirect()->route('employees.index')->with('success', $message)->with('import_errors', $errors);

        } catch (\Exception $e) {
            // Add logging for errors
            Log::error('Import failed', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat import: ' . $e->getMessage());
        }
    }

    /**
     * Download template Excel untuk import
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $headers = [
            'Nomor',
            'Nama',
        ];

        $sampleData = [
            ['001', 'John Doe'],
            ['002', 'Jane Smith'],
            ['003', 'Bob Johnson'],
            ['004', 'Alice Brown'],
            ['005', 'Charlie Wilson'],
        ];

        // Gabungkan header dengan sample data
        $data = array_merge([$headers], $sampleData);

        // Buat file Excel
        $export = new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
            private $data;

            public function __construct($data)
            {
                $this->data = $data;
            }

            public function array(): array
            {
                return $this->data;
            }
        };

        return Excel::download($export, 'template_import_employee.xlsx');
    }
}

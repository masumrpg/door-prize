<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
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
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:2048',
        ]);

        try {
            $file = $request->file('file');
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

            // Cari index kolom yang diperlukan - tidak wajib ada keduanya
            $nameIndex = $this->findColumnIndex($header, ['name', 'nama', 'employee_name', 'nama_karyawan']);
            $departmentIndex = $this->findColumnIndex($header, ['department', 'departemen', 'dept', 'divisi']);

            if ($nameIndex === null && $departmentIndex === null) {
                return redirect()->back()->with('error', 'Tidak ada kolom yang dikenali. Pastikan file Excel memiliki kolom "Name" atau "Department".');
            }

            $successCount = 0;
            $errors = [];

            foreach ($rows as $rowIndex => $row) {
                $rowNumber = $rowIndex + 2; // +2 karena array dimulai dari 0 dan header dihapus

                // Skip row kosong
                if (empty(array_filter($row))) {
                    continue;
                }

                $name = isset($row[$nameIndex]) ? trim($row[$nameIndex]) : '';
                $department = isset($row[$departmentIndex]) ? trim($row[$departmentIndex]) : '';

                // Validasi data - minimal salah satu harus ada
                if (empty($name) && empty($department)) {
                    $errors[] = "Baris {$rowNumber}: Nama dan Departemen tidak boleh kosong semua.";
                    continue;
                }

                $validator = Validator::make([
                    'name' => $name,
                    'department' => $department,
                ], [
                    'name' => 'nullable|string|max:255',
                    'department' => 'nullable|string|max:255',
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNumber}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                try {
                    // Cek apakah employee sudah ada berdasarkan nama (jika nama ada)
                    $existingEmployee = null;
                    if (!empty($name)) {
                        $existingEmployee = Employee::where('name', $name)->first();
                    }

                    if ($existingEmployee) {
                        // Update department jika employee sudah ada dan department tidak kosong
                        $updateData = [];
                        if (!empty($department)) {
                            $updateData['department'] = $department;
                        }

                        if (!empty($updateData)) {
                            $existingEmployee->update($updateData);
                        }
                    } else {
                        // Buat employee baru
                        $createData = [
                            'is_active' => true, // Default aktif
                        ];

                        if (!empty($name)) {
                            $createData['name'] = $name;
                        }

                        if (!empty($department)) {
                            $createData['department'] = $department;
                        }

                        Employee::create($createData);
                    }

                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = "Baris {$rowNumber}: Gagal menyimpan data - " . $e->getMessage();
                }
            }

            $message = "Berhasil import {$successCount} data karyawan.";
            if (!empty($errors)) {
                $message .= " Terdapat " . count($errors) . " error.";
            }

            return redirect()->back()->with('success', $message)->with('import_errors', $errors);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat import: ' . $e->getMessage());
        }
    }

    /**
     * Cari index kolom berdasarkan nama-nama yang mungkin
     */
    private function findColumnIndex(array $header, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $index = array_search($name, $header);
            if ($index !== false) {
                return $index;
            }
        }
        return null;
    }

    /**
     * Download template Excel untuk import
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $headers = [
            'Name',
            'Department',
        ];

        $sampleData = [
            ['John Doe', 'IT'],
            ['Jane Smith', ''], // Contoh departemen kosong
            ['', 'HR'], // Contoh nama kosong
            ['Bob Johnson', 'Finance'],
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

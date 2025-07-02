<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fira', 'Gilang', 'Hani', 'Indra', 'Joko',
            'Kartika', 'Lisa', 'Masum', 'Nita', 'Oscar', 'Putri', 'Qori', 'Rian', 'Sari', 'Tono',
            'Ulfa', 'Vina', 'Wati', 'Xena', 'Yanto', 'Zara', 'Adi', 'Bella', 'Candra', 'Dina'
        ];

        $departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
        $positions = ['Staff', 'Senior Staff', 'Supervisor', 'Manager', 'Senior Manager'];

        for ($i = 1; $i <= 1400; $i++) {
            $randomName = $names[array_rand($names)];
            Employee::create([
                'employee_id' => sprintf('EMP%04d', $i),
                'name' => $randomName . ' ' . $i,
                'department' => $departments[array_rand($departments)],
                'position' => $positions[array_rand($positions)],
                'is_active' => true,
            ]);
        }
    }
}

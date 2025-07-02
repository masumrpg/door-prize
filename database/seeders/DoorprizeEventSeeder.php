<?php

namespace Database\Seeders;

use App\Models\DoorprizeEvent;
use Illuminate\Database\Seeder;

class DoorprizeEventSeeder extends Seeder
{
    public function run(): void
    {
        DoorprizeEvent::create([
            'name' => 'Doorprize Karyawan 2024',
            'description' => 'Event doorprize tahunan untuk seluruh karyawan',
            'event_date' => now()->format('Y-m-d'),
            'status' => 'active',
        ]);
    }
}

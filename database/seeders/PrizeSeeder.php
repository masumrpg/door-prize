<?php

namespace Database\Seeders;

use App\Models\Prize;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrizeSeeder extends Seeder
{
    public function run(): void
    {
        $prizes = [
            [
                'name' => 'Kulkas 2 Pintu',
                'description' => 'Kulkas 2 pintu kapasitas besar untuk keluarga',
                'image_url' => 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-blue-600 to-blue-700',
                'total_stock' => 5,
                'remaining_stock' => 5,
                'estimated_value' => 8000000,
                'sort_order' => 1,
            ],
            [
                'name' => 'Smart TV 55"',
                'description' => 'Smart TV 55 inch dengan fitur streaming',
                'image_url' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-indigo-600 to-indigo-700',
                'total_stock' => 3,
                'remaining_stock' => 3,
                'estimated_value' => 12000000,
                'sort_order' => 2,
            ],
            [
                'name' => 'iPhone 15 Pro',
                'description' => 'iPhone 15 Pro terbaru dengan fitur canggih',
                'image_url' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-slate-700 to-slate-800',
                'total_stock' => 2,
                'remaining_stock' => 2,
                'estimated_value' => 20000000,
                'sort_order' => 3,
            ],
            [
                'name' => 'MacBook Air M3',
                'description' => 'MacBook Air dengan chip M3 terbaru',
                'image_url' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-purple-600 to-purple-700',
                'total_stock' => 1,
                'remaining_stock' => 1,
                'estimated_value' => 25000000,
                'sort_order' => 4,
            ],
            [
                'name' => 'Apple Watch Series 9',
                'description' => 'Apple Watch Series 9 dengan fitur kesehatan terlengkap',
                'image_url' => 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-emerald-600 to-emerald-700',
                'total_stock' => 4,
                'remaining_stock' => 4,
                'estimated_value' => 8000000,
                'sort_order' => 5,
            ],
            [
                'name' => 'Voucher Belanja 5 Juta',
                'description' => 'Voucher belanja senilai 5 juta rupiah',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-amber-600 to-amber-700',
                'total_stock' => 10,
                'remaining_stock' => 10,
                'estimated_value' => 5000000,
                'sort_order' => 6,
            ],
            [
                'name' => 'Sepeda Gunung',
                'description' => 'Sepeda gunung untuk petualangan outdoor',
                'image_url' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-teal-600 to-teal-700',
                'total_stock' => 2,
                'remaining_stock' => 2,
                'estimated_value' => 6000000,
                'sort_order' => 7,
            ],
            [
                'name' => 'AirPods Pro',
                'description' => 'AirPods Pro dengan noise cancellation',
                'image_url' => 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop&crop=center',
                'color' => 'from-rose-600 to-rose-700',
                'total_stock' => 6,
                'remaining_stock' => 6,
                'estimated_value' => 4000000,
                'sort_order' => 8,
            ],
        ];

        foreach ($prizes as $prize) {
            Prize::create($prize);
        }
    }
}

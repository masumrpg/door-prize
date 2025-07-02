<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('prize_id')->constrained()->onDelete('cascade');
            $table->foreignId('doorprize_event_id')->constrained()->onDelete('cascade');
            $table->integer('winner_number'); // Urutan pemenang untuk hadiah yang sama
            $table->timestamp('drawn_at');
            $table->string('drawn_by')->nullable(); // User yang melakukan undian
            $table->text('notes')->nullable();
            $table->timestamps();

            // Pastikan satu karyawan hanya bisa menang satu hadiah yang sama
            $table->unique(['employee_id', 'prize_id', 'doorprize_event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('winners');
    }
};

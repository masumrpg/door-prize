<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'department',
        'position',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function winners(): HasMany
    {
        return $this->hasMany(Winner::class);
    }

    public function hasWonPrize(Prize $prize, DoorprizeEvent $event): bool
    {
        return $this->winners()
            ->where('prize_id', $prize->id)
            ->where('doorprize_event_id', $event->id)
            ->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailableForPrize($query, Prize $prize, DoorprizeEvent $event)
    {
        return $query->active()
            ->whereDoesntHave('winners', function ($q) use ($prize, $event) {
                $q->where('prize_id', $prize->id)
                    ->where('doorprize_event_id', $event->id);
            });
    }
}


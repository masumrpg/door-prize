<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Winner extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'prize_id',
        'doorprize_event_id',
        'winner_number',
        'drawn_at',
        'drawn_by',
        'notes',
    ];

    protected $casts = [
        'drawn_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function prize(): BelongsTo
    {
        return $this->belongsTo(Prize::class);
    }

    public function doorprizeEvent(): BelongsTo
    {
        return $this->belongsTo(DoorprizeEvent::class);
    }

    public function getTimestampAttribute(): string
    {
        return $this->drawn_at->format('H:i:s');
    }

    public function scopeForEvent($query, DoorprizeEvent $event)
    {
        return $query->where('doorprize_event_id', $event->id);
    }

    public function scopeForPrize($query, Prize $prize)
    {
        return $query->where('prize_id', $prize->id);
    }

    public static function getNextWinnerNumber(Prize $prize, DoorprizeEvent $event): int
    {
        return static::where('prize_id', $prize->id)
                ->where('doorprize_event_id', $event->id)
                ->max('winner_number') + 1;
    }
}

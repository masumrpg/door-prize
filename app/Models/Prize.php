<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prize extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image_url',
        'color',
        'total_stock',
        'remaining_stock',
        'estimated_value',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function winners(): HasMany
    {
        return $this->hasMany(Winner::class);
    }

    public function winnersForEvent(DoorprizeEvent $event): HasMany
    {
        return $this->winners()->where('doorprize_event_id', $event->id);
    }

    public function getStockAttribute(): int
    {
        return $this->remaining_stock;
    }

    public function getTotalStockAttribute(): int
    {
        return $this->attributes['total_stock'];
    }

    public function isOutOfStock(): bool
    {
        return $this->remaining_stock <= 0;
    }

    public function canBeDrawn(): bool
    {
        return $this->is_active && !$this->isOutOfStock();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('remaining_stock', '>', 0);
    }

    public function scopeAvailable($query)
    {
        return $query->active()->inStock();
    }

    public function decrementStock(): bool
    {
        if ($this->remaining_stock > 0) {
            $this->decrement('remaining_stock');
            return true;
        }
        return false;
    }
}


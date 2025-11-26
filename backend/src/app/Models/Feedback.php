<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;
    protected $table = 'feedback';
    protected $fillable = [
        'target_id',
        'category',
        'title',
        'text',
    ];

    protected $casts = [
        'category' => 'string',
    ];

    public function target(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'target_id');
    }

}

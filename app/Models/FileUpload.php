<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileUpload extends Model
{
    protected $fillable = [
        'user_id',
        'filename',
        'filesize',
        'total_chunks',
        'uploaded_chunks',
        'path',
        'status',
    ];
}

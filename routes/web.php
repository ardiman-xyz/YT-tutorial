<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileUploadController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/upload-file', [FileUploadController::class, 'index'])->name('upload.index');
    Route::post('/upload-file', [FileUploadController::class, 'store'])->name('upload.store');

    Route::post('/upload/initialize', [FileUploadController::class, 'initialize']);
    Route::post('/upload/chunk', [FileUploadController::class, 'uploadChunk']);
    Route::post('/upload/complete', [FileUploadController::class, 'complete']);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

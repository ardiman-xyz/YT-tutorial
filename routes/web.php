<?php

use App\Http\Controllers\BookmarksController;
use App\Http\Controllers\ExploreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReplyController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
     Route::get('/dashboard', [PostController::class, 'index'])->name('dashboard');

    Route::get('/upload-file', [FileUploadController::class, 'index'])->name('upload.index');
    Route::post('/upload-file', [FileUploadController::class, 'store'])->name('upload.store');

    Route::post('/upload/initialize', [FileUploadController::class, 'initialize']);
    Route::post('/upload/chunk', [FileUploadController::class, 'uploadChunk']);
    Route::post('/upload/complete', [FileUploadController::class, 'complete']);

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/messages', [MessagesController::class, 'index'])->name('messages.index');
    Route::get('/messages/{id}', [MessagesController::class, 'show'])->name('messages.show');
    Route::post('/messages', [MessagesController::class, 'store'])->name('messages.store');

    Route::get('/explore', [ExploreController::class, 'index'])->name('explore.index');
    Route::get('/search', [ExploreController::class, 'search'])->name('explore.search');

    Route::get('/bookmarks', [BookmarksController::class, 'index'])->name('bookmarks.index');
    Route::post('/bookmarks/clear', [BookmarksController::class, 'clearAll'])->name('bookmarks.clear');


    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('/status/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{post}/like', [PostController::class, 'toggleLike'])->name('posts.like');
    Route::post('/users/{user}/follow', [FollowController::class, 'toggle'])->name('users.follow');
    Route::post('/posts/{post}/repost', [PostController::class, 'toggleRepost'])->name('posts.repost');
    Route::post('/posts/{post}/bookmark', [PostController::class, 'toggleBookmark'])->name('posts.bookmark');

    Route::post('/posts/{post}/bookmark', [PostController::class, 'toggleBookmark'])->name('posts.bookmark');
    Route::post('/posts/{post}/replies', [ReplyController::class, 'store'])->name('posts.replies.store');
    Route::get('/posts/{post}/replies', [ReplyController::class, 'index'])->name('posts.replies.index');
    Route::delete('/posts/{post}/replies/{reply}', [ReplyController::class, 'destroy'])->name('posts.replies.destroy');

    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/{user}/likes', [ProfileController::class, 'likes'])->name('profile.likes');
    Route::get('/profile/{user}/media', [ProfileController::class, 'media'])->name('profile.media');

    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

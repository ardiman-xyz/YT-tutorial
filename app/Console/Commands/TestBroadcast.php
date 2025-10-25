<?php

namespace App\Console\Commands;

use App\Events\TestNotification;
use App\Models\User;
use Illuminate\Console\Command;

class TestBroadcast extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'broadcast:test {userId?} {message?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test broadcasting by sending a notification to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get user ID from argument or ask
        $userId = $this->argument('userId');
        
        if (!$userId) {
            $userId = $this->ask('Enter User ID to send notification to');
        }

        // Validate user exists
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("❌ User with ID {$userId} not found!");
            return 1;
        }

        // Get message from argument or ask
        $message = $this->argument('message');
        
        if (!$message) {
            $message = $this->ask('Enter notification message', 'Hello from Reverb! 🚀');
        }

        // Broadcast the event
        $this->info("📡 Broadcasting to user.{$userId}...");
        
        broadcast(new TestNotification($message, (int)$userId));

        $this->info("✅ Notification sent successfully!");
        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->line("👤 User: {$user->name} (@{$user->username})");
        $this->line("📢 Channel: user.{$userId}");
        $this->line("💬 Message: {$message}");
        $this->line("🕐 Time: " . now()->format('Y-m-d H:i:s'));
        $this->line("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return 0;
    }
}
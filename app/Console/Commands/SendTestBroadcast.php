<?php

namespace App\Console\Commands;

use App\Events\TestBroadcast;
use Illuminate\Console\Command;

class SendTestBroadcast extends Command
{
    protected $signature = 'test:broadcast {message?}';
    protected $description = 'Send test broadcast to public channel "test"';

    public function handle()
    {
        $message = $this->argument('message') ?? 'Hello from test channel! 🚀';

        $this->info('📡 Broadcasting to public channel: test');
        $this->info('💬 Message: ' . $message);
        
        broadcast(new TestBroadcast($message));
        
        $this->info('✅ Broadcast sent!');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->comment('Check browser console and network tab!');

        return 0;
    }
}
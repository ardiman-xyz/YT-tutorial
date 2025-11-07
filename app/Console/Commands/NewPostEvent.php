<?php

namespace App\Console\Commands;

use App\Events\PostEvent;
use Illuminate\Console\Command;

class NewPostEvent extends Command
{
    protected $signature = 'app:new-post {--user=1}';
    protected $description = 'Broadcast fake new post event';

    public function handle()
    {
        $userOption = $this->option('user');

        // Data user palsu
        $fakeUsers = [
            1 => [
                'id' => 1,
                'name' => 'Elon Musk',
                'username' => 'elonmusk',
                'avatar' => 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
            ],
            2 => [
                'id' => 2,
                'name' => 'Mark Zuckerberg',
                'username' => 'zuck',
                'avatar' => 'https://pbs.twimg.com/profile_images/1596575444560818178/onZgHFwT_400x400.jpg',
            ],
        ];

        $selectedUser = $fakeUsers[$userOption] ?? $fakeUsers[1];

        // Data post palsu
        $fakePost = [
            'id' => rand(1000, 9999),
            'content' => $this->getRandomContent(),
            'user' => $selectedUser,
            'created_at' => now()->toISOString(),
        ];

        // Broadcast event
        event(new PostEvent($fakePost));

        $this->info("✅ Post event broadcasted from {$selectedUser['name']}!");
        $this->line("Content: {$fakePost['content']}");
    }

    private function getRandomContent(): string
    {
        $contents = [
            "Just shipped a new feature! 🚀",
            "Working on something exciting... Stay tuned!",
            "Coffee + Code = Perfect combo ☕💻",
            "Another day, another bug fixed 🐛",
            "Learning new things every day! 📚",
            "This is a test post from command line!",
            "Building amazing things! 🎉",
        ];

        return $contents[array_rand($contents)];
    }
}
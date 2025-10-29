<?php

namespace App\Console\Commands;

use App\Events\OrderStatusUpdatedEvent;
use Illuminate\Console\Command;

class Event extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
         event(new OrderStatusUpdatedEvent("from event!"));
    }
}

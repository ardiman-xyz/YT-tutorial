import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export default function EmptyState() {
    return (
        <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-sm">
                <h2 className="mb-2 text-2xl font-bold">Select a message</h2>
                <p className="mb-4 text-muted-foreground">
                    Choose from your existing conversations or start a new one
                </p>
                <Button
                    onClick={() => router.visit('/messages/new')}
                    className="rounded-full"
                >
                    New message
                </Button>
            </div>
        </div>
    );
}

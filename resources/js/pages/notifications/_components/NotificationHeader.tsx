import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CheckCheck, Settings } from 'lucide-react';

export function NotificationHeader({
    onMarkAllRead,
}: {
    onMarkAllRead: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b p-4">
            <h1 className="text-xl font-bold">Notifications</h1>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={onMarkAllRead}>
                    <CheckCheck className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.visit('/settings/notifications')}
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

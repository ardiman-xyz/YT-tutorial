import { useEcho } from '@laravel/echo-react';
import { useEffect } from 'react';

export default function NotificationTest() {
    useEffect(() => {
        console.log('🔍 Component mounted');
        console.log('🔍 Attempting to subscribe to channel: test');
    }, []);

    // Listen to public test channel
    useEcho('test', 'TestBroadcast', (e: any) => {
        console.log('═══════════════════════════════');
        console.log('✅ EVENT RECEIVED FROM TEST CHANNEL!');
        console.log('Event:', e);
        console.log('Message:', e.message);
        console.log('═══════════════════════════════');
        alert(`✅ ${e.message}`);
    });

    useEffect(() => {
        console.log('✅ useEcho hook executed for channel: test');
        console.log('✅ Listening for event: TestBroadcast');
    }, []);

    return (
        <div className="fixed right-4 bottom-4 rounded-lg bg-blue-500 p-3 text-white shadow-lg">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-sm font-semibold">📡 test</span>
            </div>
        </div>
    );
}

import { useEcho } from '@laravel/echo-react';
import { useEffect } from 'react';
import { Message } from '../conversation';

interface UseEchoListenerProps {
    conversationId: number | null;
    currentUserId: number;
    onNewMessage: (message: Message) => void;
    onUserTyping?: (isTyping: boolean) => void;
}

export function useEchoListener({
    conversationId,
    currentUserId,
    onNewMessage,
    onUserTyping,
}: UseEchoListenerProps) {
    // Listen for new messages
    useEcho(
        conversationId ? `conversation.${conversationId}` : '',
        '.message.sent',
        (data: any) => {
            console.log('📩 New message received:', data);

            onNewMessage({
                id: data.id,
                content: data.content,
                sender_id: data.sender_id,
                created_at: data.created_at,
            });
        },
    );

    // Debug logging in development
    useEffect(() => {
        if (!import.meta.env.DEV || !conversationId) return;

        console.group('🔊 Echo Channel Info');
        console.log('Selected Conversation ID:', conversationId);
        console.log('Channel Name:', `private-conversation.${conversationId}`);
        console.log('Listening Events:', ['message.sent', 'user.typing']);
        console.log('Current User ID:', currentUserId);

        // @ts-ignore
        const echo = window.Echo;
        if (echo) {
            console.log('Echo Instance:', echo);
            console.log('Echo Connector:', echo.connector);

            if (echo.connector?.channels) {
                const activeChannels = Object.keys(echo.connector.channels);
                console.log('All Active Channels:', activeChannels);

                const ourChannel = `private-conversation.${conversationId}`;
                const isSubscribed = activeChannels.some((ch) =>
                    ch.includes(ourChannel),
                );
                console.log(
                    `Channel "${ourChannel}" subscribed:`,
                    isSubscribed,
                );
            }
        } else {
            console.warn('Echo not initialized!');
        }
        console.groupEnd();
    }, [conversationId, currentUserId]);
}

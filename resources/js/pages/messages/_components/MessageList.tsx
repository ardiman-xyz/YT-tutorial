import { useEffect, useRef } from 'react';
import { Message } from '../conversation';

interface MessageListProps {
    messages: Message[];
    currentUserId: number;
    isTyping?: boolean;
    typingUserName?: string;
}

export default function MessageList({
    messages,
    currentUserId,
    isTyping = false,
    typingUserName,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor(
            (now.getTime() - date.getTime()) / 3600000,
        );

        if (diffHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    if (messages.length === 0 && !isTyping) {
        return (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                    <p className="text-lg font-semibold">No messages yet</p>
                    <p className="mt-1 text-sm">Start the conversation!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUserId;

                return (
                    <div
                        key={index + 1}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            }`}
                        >
                            <p className="break-words">{message.content}</p>
                            <p
                                className={`mt-1 text-xs ${
                                    isOwnMessage
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {formatMessageTime(message.created_at)}
                            </p>
                        </div>
                    </div>
                );
            })}

            {/* Typing Indicator */}
            {isTyping && typingUserName && (
                <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2">
                        <div className="flex gap-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {typingUserName} is typing...
                        </span>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search, Settings } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from '../conversation';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: number | null;
    onConversationSelect: (id: number) => void;
}

export default function ConversationList({
    conversations,
    selectedConversationId,
    onConversationSelect,
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredConversations = conversations.filter(
        (conv) =>
            conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.user.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="flex h-full w-full flex-col border-r">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Messages</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => router.visit('/messages/new')}
                        >
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z" />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search Direct Messages"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() =>
                                onConversationSelect(conversation.id)
                            }
                            className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-muted/50 ${
                                selectedConversationId === conversation.id
                                    ? 'border-r-2 border-r-primary bg-muted/50'
                                    : ''
                            }`}
                        >
                            {/* Avatar with online indicator */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={conversation.user.avatar}
                                        alt={conversation.user.name}
                                    />
                                    <AvatarFallback>
                                        {conversation.user.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {conversation.user.is_online && (
                                    <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1">
                                        <span className="truncate font-bold">
                                            {conversation.user.name}
                                        </span>
                                        {conversation.user.is_verified && (
                                            <svg
                                                className="h-4 w-4 flex-shrink-0 text-blue-500"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                            </svg>
                                        )}
                                        <span className="truncate text-sm text-muted-foreground">
                                            @{conversation.user.username}
                                        </span>
                                    </div>
                                    {conversation.last_message && (
                                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                                            {formatMessageTime(
                                                conversation.last_message
                                                    .created_at,
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Last message */}
                                {conversation.last_message && (
                                    <div className="flex items-center gap-2">
                                        <p
                                            className={`flex-1 truncate text-sm ${
                                                !conversation.last_message
                                                    .is_read
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {conversation.last_message.content}
                                        </p>
                                        {conversation.unread_count > 0 && (
                                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                {conversation.unread_count}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 rounded-full bg-muted p-6">
                            <svg
                                className="h-12 w-12 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">
                            No conversations yet
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Start a conversation by sending a message to someone
                            you follow
                        </p>
                        <Button
                            onClick={() => router.visit('/messages/new')}
                            className="rounded-full"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Start a conversation
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

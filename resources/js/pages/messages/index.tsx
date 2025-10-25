import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Image as ImageIcon,
    Info,
    MoreVertical,
    Search,
    Send,
    Settings,
    Smile,
} from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
}

interface Conversation {
    id: number;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        is_verified: boolean;
        is_online: boolean;
    };
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
    };
    unread_count: number;
}

interface MessagesData {
    conversations: Conversation[];
    active_conversation?: Conversation;
    messages: Message[];
}

export default function Messages() {
    const { auth, conversations, active_conversation, messages } =
        usePage<any>().props as {
            auth: { user: User };
            conversations: Conversation[];
            active_conversation?: Conversation;
            messages: Message[];
        };

    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<
        number | null
    >(active_conversation?.id || null);

    const handleConversationClick = (conversationId: number) => {
        setSelectedConversation(conversationId);
        router.visit(`/messages/${conversationId}`);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        // TODO: Send message
        console.log('Send message:', messageInput);
        setMessageInput('');
    };

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
        <AppLayout isRightSidebarOpen={false}>
            <Head title="Messages" />

            <div className="mx-auto flex h-[calc(100vh-4rem)] border-x">
                {/* Conversations List */}
                <div
                    className={`w-full border-r md:w-96 ${selectedConversation ? 'hidden md:block' : ''}`}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 border-b bg-background p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Messages</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <Settings className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() =>
                                        router.visit('/messages/new')
                                    }
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
                                        handleConversationClick(conversation.id)
                                    }
                                    className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-muted/50 ${
                                        selectedConversation === conversation.id
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
                                                {conversation.user
                                                    .is_verified && (
                                                    <svg
                                                        className="h-4 w-4 flex-shrink-0 text-blue-500"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                                    </svg>
                                                )}
                                                <span className="truncate text-sm text-muted-foreground">
                                                    @
                                                    {conversation.user.username}
                                                </span>
                                            </div>
                                            {conversation.last_message && (
                                                <span className="flex-shrink-0 text-xs text-muted-foreground">
                                                    {formatMessageTime(
                                                        conversation
                                                            .last_message
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
                                                        !conversation
                                                            .last_message
                                                            .is_read
                                                            ? 'font-semibold text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {
                                                        conversation
                                                            .last_message
                                                            .content
                                                    }
                                                </p>
                                                {conversation.unread_count >
                                                    0 && (
                                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                        {
                                                            conversation.unread_count
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <p>No conversations found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation View */}
                <div
                    className={`flex flex-1 flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}
                >
                    {selectedConversation && active_conversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b p-4">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setSelectedConversation(null)
                                        }
                                        className="h-9 w-9 md:hidden"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>

                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={
                                                active_conversation.user.avatar
                                            }
                                            alt={active_conversation.user.name}
                                        />
                                        <AvatarFallback>
                                            {active_conversation.user.name
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">
                                                {active_conversation.user.name}
                                            </span>
                                            {active_conversation.user
                                                .is_verified && (
                                                <svg
                                                    className="h-4 w-4 text-blue-500"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            @{active_conversation.user.username}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <Info className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                                {messages.length > 0 ? (
                                    messages.map((message) => {
                                        const isOwnMessage =
                                            message.sender_id === auth.user.id;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs rounded-2xl px-4 py-2 ${
                                                        isOwnMessage
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                    }`}
                                                >
                                                    <p className="break-words">
                                                        {message.content}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-xs ${
                                                            isOwnMessage
                                                                ? 'text-primary-foreground/70'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {formatMessageTime(
                                                            message.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                                        <div>
                                            <p className="text-lg font-semibold">
                                                No messages yet
                                            </p>
                                            <p className="mt-1 text-sm">
                                                Start the conversation!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="border-t p-4">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-end gap-2"
                                >
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                        >
                                            <ImageIcon className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                        >
                                            <Smile className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <Input
                                        type="text"
                                        placeholder="Start a new message"
                                        value={messageInput}
                                        onChange={(e) =>
                                            setMessageInput(e.target.value)
                                        }
                                        className="flex-1"
                                    />

                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!messageInput.trim()}
                                        className="h-9 w-9 rounded-full"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center">
                            <div className="max-w-sm">
                                <h2 className="mb-2 text-2xl font-bold">
                                    Select a message
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    Choose from your existing conversations or
                                    start a new one
                                </p>
                                <Button
                                    onClick={() =>
                                        router.visit('/messages/new')
                                    }
                                    className="rounded-full"
                                >
                                    New message
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

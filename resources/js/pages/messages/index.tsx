import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ChatHeader from './_components/ChatHeader';
import ConversationList from './_components/ConversationList';
import EmptyState from './_components/EmptyState';
import MessageInput from './_components/MessageInput';
import MessageList from './_components/MessageList';
import { useEchoListener } from './_hooks/useEchoListener';
import { useMessageHandler } from './_hooks/useMessageHandler';
import { Conversation, Message } from './conversation';
import { addMessageIfNotExists } from './messageUtils';

export default function Messages() {
    const {
        auth,
        conversations: initialConversations,
        active_conversation,
        messages: initialMessages,
    } = usePage<any>().props as {
        auth: { user: User };
        conversations: Conversation[];
        active_conversation?: Conversation;
        messages: Message[];
    };

    const [selectedConversation, setSelectedConversation] = useState<
        number | null
    >(active_conversation?.id || null);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    // Custom hooks
    const { messageInput, handleInputChange, handleSendMessage } =
        useMessageHandler({
            selectedConversation,
        });

    useEchoListener({
        conversationId: selectedConversation,
        currentUserId: auth.user.id,
        onNewMessage: (message) => {
            setMessages((prev) => addMessageIfNotExists(prev, message));
        },
        onUserTyping: (isTyping) => {
            setOtherUserTyping(isTyping);
        },
    });

    const handleConversationClick = (conversationId: number) => {
        console.log('🗨️ Conversation selected:', conversationId);
        setSelectedConversation(conversationId);
        router.visit(`/messages/${conversationId}`);
    };

    const handleMessageSubmit = (e: React.FormEvent) => {
        handleSendMessage(e, (newMessage) => {
            setMessages((prev) => addMessageIfNotExists(prev, newMessage));
        });
    };

    return (
        <AppLayout isRightSidebarOpen={false}>
            <Head title="Messages" />

            <div className="h-[calc(100vh-4rem)] border-x">
                {/* Mobile View - No Resizable */}
                <div className="flex h-full md:hidden">
                    {/* Show conversation list or chat based on selection */}
                    {!selectedConversation ? (
                        <div className="w-full">
                            <ConversationList
                                conversations={initialConversations}
                                selectedConversationId={selectedConversation}
                                onConversationSelect={handleConversationClick}
                            />
                        </div>
                    ) : (
                        <div className="flex w-full flex-col">
                            {active_conversation && (
                                <>
                                    <ChatHeader
                                        conversation={active_conversation}
                                        onBack={() =>
                                            setSelectedConversation(null)
                                        }
                                    />

                                    <MessageList
                                        messages={messages}
                                        currentUserId={auth.user.id}
                                        isTyping={otherUserTyping}
                                        typingUserName={
                                            active_conversation.user.name
                                        }
                                    />

                                    <MessageInput
                                        value={messageInput}
                                        onChange={handleInputChange}
                                        onSubmit={handleMessageSubmit}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop View - With Resizable */}
                <ResizablePanelGroup
                    direction="horizontal"
                    className="hidden h-full md:flex"
                >
                    {/* Conversations List Panel */}
                    <ResizablePanel
                        defaultSize={30}
                        minSize={20}
                        maxSize={50}
                        className="min-w-[280px]"
                    >
                        <ConversationList
                            conversations={initialConversations}
                            selectedConversationId={selectedConversation}
                            onConversationSelect={handleConversationClick}
                        />
                    </ResizablePanel>

                    {/* Resizable Handle */}
                    <ResizableHandle withHandle />

                    {/* Chat Area Panel */}
                    <ResizablePanel defaultSize={70} minSize={50}>
                        <div className="flex h-full flex-col">
                            {selectedConversation && active_conversation ? (
                                <>
                                    <ChatHeader
                                        conversation={active_conversation}
                                        onBack={() =>
                                            setSelectedConversation(null)
                                        }
                                    />

                                    <MessageList
                                        messages={messages}
                                        currentUserId={auth.user.id}
                                        isTyping={otherUserTyping}
                                        typingUserName={
                                            active_conversation.user.name
                                        }
                                    />

                                    <MessageInput
                                        value={messageInput}
                                        onChange={handleInputChange}
                                        onSubmit={handleMessageSubmit}
                                    />
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </AppLayout>
    );
}

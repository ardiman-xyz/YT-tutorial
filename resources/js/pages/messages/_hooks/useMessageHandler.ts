import axios from 'axios';
import { useRef, useState } from 'react';
import { Message } from '../conversation';

interface UseMessageHandlerProps {
    selectedConversation: number | null;
}

export function useMessageHandler({
    selectedConversation,
}: UseMessageHandlerProps) {
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTyping = async (typing: boolean) => {
        if (!selectedConversation) return;

        try {
            await axios.post('/messages/typing', {
                conversation_id: selectedConversation,
                is_typing: typing,
            });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        // Send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            handleTyping(true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            handleTyping(false);
        }, 2000);
    };

    const handleSendMessage = async (
        e: React.FormEvent,
        onSuccess: (message: Message) => void,
    ) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const response = await axios.post('/messages', {
                conversation_id: selectedConversation,
                content: messageInput.trim(),
            });

            const newMessage: Message = {
                id: response.data.message.id,
                content: response.data.message.content,
                sender_id: response.data.message.sender_id,
                created_at: response.data.message.created_at,
            };

            onSuccess(newMessage);
            setMessageInput('');
            handleTyping(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return {
        messageInput,
        handleInputChange,
        handleSendMessage,
    };
}

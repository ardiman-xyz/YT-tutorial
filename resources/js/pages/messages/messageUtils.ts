import { Message } from './conversation';

/**
 * Check if a message already exists in the messages array
 */
export function messageExists(messages: Message[], messageId: number): boolean {
    return messages.some((msg) => msg.id === messageId);
}

/**
 * Add message to array only if it doesn't exist
 */
export function addMessageIfNotExists(
    messages: Message[],
    newMessage: Message,
): Message[] {
    if (messageExists(messages, newMessage.id)) {
        console.log('⚠️ Message already exists, skipping:', newMessage.id);
        return messages;
    }
    return [...messages, newMessage];
}

/**
 * Merge messages from different sources and remove duplicates
 */
export function mergeMessages(
    existingMessages: Message[],
    newMessages: Message[],
): Message[] {
    const messageMap = new Map<number, Message>();

    // Add existing messages
    existingMessages.forEach((msg) => messageMap.set(msg.id, msg));

    // Add new messages (will overwrite if duplicate)
    newMessages.forEach((msg) => messageMap.set(msg.id, msg));

    // Convert back to array and sort by created_at
    return Array.from(messageMap.values()).sort(
        (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}

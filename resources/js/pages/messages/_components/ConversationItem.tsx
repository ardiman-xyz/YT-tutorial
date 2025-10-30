import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Conversation } from '../conversation';

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

export default function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: ConversationItemProps) {
    const { user, last_message } = conversation;

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                isSelected && 'bg-muted',
            )}
        >
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{user.name}</p>
                    {last_message?.created_at && (
                        <span className="ml-2 text-xs whitespace-nowrap text-muted-foreground">
                            {formatDistanceToNow(
                                new Date(last_message.created_at),
                                {
                                    addSuffix: true,
                                    locale: idLocale,
                                },
                            )}
                        </span>
                    )}
                </div>

                <p className="truncate text-sm text-muted-foreground">
                    {last_message
                        ? last_message.content
                        : 'Mulai percakapan baru'}
                </p>
            </div>
        </button>
    );
}

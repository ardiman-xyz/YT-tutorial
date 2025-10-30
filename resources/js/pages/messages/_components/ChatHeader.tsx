import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, MoreVertical } from 'lucide-react';
import { Conversation } from '../conversation';

interface ChatHeaderProps {
    conversation: Conversation;
    onBack: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-9 w-9 md:hidden"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src={conversation.user.avatar}
                        alt={conversation.user.name}
                    />
                    <AvatarFallback>
                        {conversation.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-bold">
                            {conversation.user.name}
                        </span>
                        {conversation.user.is_verified && (
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
                        @{conversation.user.username}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

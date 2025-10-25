import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { Message02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

type ChatButtonProps = {
    comments: number;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function ChatButton({ comments, onClick }: ChatButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`group relative flex items-center gap-1.5 transition-all duration-300 ease-out hover:scale-110 hover:text-blue-500 active:scale-95`}
        >
            <div
                className={`relative flex items-center justify-center rounded-full p-1 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-blue-400/40 group-hover:ring-offset-2`}
            >
                <HugeiconsIcon
                    icon={Message02Icon}
                    size={20}
                    className="h-5 w-5 transition-transform duration-300 ease-out group-hover:-rotate-6"
                />
            </div>

            <span className="text-xs transition-colors duration-300 group-hover:text-blue-500">
                {formatNumber(comments)}
            </span>
        </Button>
    );
}

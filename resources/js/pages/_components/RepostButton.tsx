import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RepeatIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import { useState } from 'react';

type RepostButtonProps = {
    isReposted: boolean;
    reposts: number;
    onRepost: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function RepostButton({
    isReposted,
    reposts,
    onRepost,
}: RepostButtonProps) {
    const [animate, setAnimate] = useState<string[]>([]);

    const formatNumber = (n: number) =>
        n >= 1_000_000
            ? (n / 1_000_000).toFixed(1) + 'M'
            : n >= 1_000
              ? (n / 1_000).toFixed(1) + 'K'
              : n.toString();

    const handleClick = (
        callback: (e: React.MouseEvent<HTMLButtonElement>) => void,
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        callback(e);

        if (isReposted) {
            setAnimate(['animate-repost-shake']);
            setTimeout(() => setAnimate([]), 400);
        } else {
            setAnimate([
                'animate-repost-bounce-spin',
                'animate-repost-ring-pulse',
                'animate-repost-burst-1',
                'animate-repost-burst-2',
                'animate-repost-burst-3',
            ]);
            setTimeout(() => setAnimate([]), 1200);
        }
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            {animate.includes('animate-repost-ring-pulse') && (
                <span className="animate-repost-ring-pulse absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/30" />
            )}

            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleClick(onRepost, e)}
                className={cn(
                    isReposted ? 'text-green-500' : '',
                    'relative z-10 flex items-center justify-center',
                )}
            >
                <HugeiconsIcon
                    icon={RepeatIcon}
                    size={20}
                    color={isReposted ? 'green' : 'currentColor'}
                    className={clsx(
                        animate.includes('animate-repost-bounce-spin') &&
                            'animate-repost-bounce-spin',
                        animate.includes('animate-repost-shake') &&
                            'animate-repost-shake',
                    )}
                />
                <span className="ml-1 text-xs">{formatNumber(reposts)}</span>
            </Button>
        </div>
    );
}

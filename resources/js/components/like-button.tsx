import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Heart, HeartCrack } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LikeButtonProps {
    isLiked: boolean;
    count: number;
    onClick: (e: React.MouseEvent) => void;
}

export function LikeButton({ isLiked, count, onClick }: LikeButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [showUnlikeEffect, setShowUnlikeEffect] = useState(false);
    const [prevLiked, setPrevLiked] = useState(isLiked);

    useEffect(() => {
        // Like animation
        if (isLiked && !prevLiked) {
            setIsAnimating(true);
            setShowParticles(true);

            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 600);

            const particleTimer = setTimeout(() => {
                setShowParticles(false);
            }, 1500);

            return () => {
                clearTimeout(timer);
                clearTimeout(particleTimer);
            };
        }

        // Unlike animation
        if (!isLiked && prevLiked) {
            setShowUnlikeEffect(true);

            const timer = setTimeout(() => {
                setShowUnlikeEffect(false);
            }, 800);

            return () => clearTimeout(timer);
        }

        setPrevLiked(isLiked);
    }, [isLiked, prevLiked]);

    const formatNumber = (n: number) =>
        n >= 1_000_000
            ? (n / 1_000_000).toFixed(1) + 'M'
            : n >= 1_000
              ? (n / 1_000).toFixed(1) + 'K'
              : n.toString();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="relative overflow-visible"
        >
            {/* Container for animation */}
            <div className="relative">
                {/* Main heart icon */}
                <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={20}
                    color={isLiked ? 'red' : 'currentColor'}
                    className={cn(
                        isLiked && 'fill-red-500',
                        isAnimating && 'animate-like-bounce',
                        showUnlikeEffect && 'animate-unlike-shake',
                    )}
                />

                {/* Flying hearts animation (UP) */}
                {showParticles && (
                    <>
                        <Heart className="animate-fly-up-1 pointer-events-none absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 fill-pink-400 text-pink-400" />
                        <Heart className="animate-fly-up-2 pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 fill-pink-500 text-pink-500" />
                        <Heart className="animate-fly-up-3 pointer-events-none absolute bottom-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 fill-red-400 text-red-400" />
                        <Heart className="animate-fly-up-4 pointer-events-none absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 fill-pink-300 text-pink-300" />
                    </>
                )}

                {/* Unlike animation - Broken heart falling */}
                {showUnlikeEffect && (
                    <>
                        <HeartCrack className="animate-break-fall-1 pointer-events-none absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 text-gray-400" />
                        <HeartCrack className="animate-break-fall-2 pointer-events-none absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 text-gray-500" />
                    </>
                )}

                {/* Circle burst effect */}
                {isAnimating && (
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="animate-circle-burst h-10 w-10 rounded-full bg-pink-200 opacity-0" />
                    </div>
                )}
            </div>

            {/* Count */}
            <span className="ml-1.5 text-xs">{formatNumber(count)}</span>
        </Button>
    );
}

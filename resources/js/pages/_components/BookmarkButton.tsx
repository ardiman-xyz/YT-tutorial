import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookmarkButtonProps {
    isBookmarked: boolean;
    onClick: (e: React.MouseEvent) => void;
}

export function BookmarkButton({ isBookmarked, onClick }: BookmarkButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [showUnsaveEffect, setShowUnsaveEffect] = useState(false);
    const [prevBookmarked, setPrevBookmarked] = useState(isBookmarked);

    useEffect(() => {
        // Save/Bookmark animation
        if (isBookmarked && !prevBookmarked) {
            setIsAnimating(true);
            setShowParticles(true);

            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 600);

            const particleTimer = setTimeout(() => {
                setShowParticles(false);
            }, 1200);

            return () => {
                clearTimeout(timer);
                clearTimeout(particleTimer);
            };
        }

        // Unsave animation
        if (!isBookmarked && prevBookmarked) {
            setShowUnsaveEffect(true);

            const timer = setTimeout(() => {
                setShowUnsaveEffect(false);
            }, 600);

            return () => clearTimeout(timer);
        }

        setPrevBookmarked(isBookmarked);
    }, [isBookmarked, prevBookmarked]);

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
                {/* Main bookmark icon */}
                <Bookmark
                    className={cn(
                        'h-5 w-5 transition-all duration-300',
                        isBookmarked
                            ? 'fill-blue-500 text-blue-500'
                            : 'text-muted-foreground',
                        isAnimating && 'animate-bookmark-bounce',
                        showUnsaveEffect && 'animate-bookmark-shake',
                    )}
                />

                {/* Sparkles animation (save) */}
                {showParticles && (
                    <>
                        {/* Stars/sparkles */}
                        <div className="animate-sparkle-1 pointer-events-none absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-yellow-400" />
                        <div className="animate-sparkle-2 pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-400" />
                        <div className="animate-sparkle-3 pointer-events-none absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-yellow-300" />
                        <div className="animate-sparkle-4 pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-300" />

                        {/* Small bookmarks falling */}
                        <Bookmark className="animate-bookmark-fall-1 pointer-events-none absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 fill-blue-400 text-blue-400" />
                        <Bookmark className="animate-bookmark-fall-2 pointer-events-none absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 fill-blue-300 text-blue-300" />
                    </>
                )}

                {/* Unsave animation - bookmark pieces */}
                {showUnsaveEffect && (
                    <>
                        <div className="animate-piece-scatter-1 pointer-events-none absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-sm bg-gray-400" />
                        <div className="animate-piece-scatter-2 pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-sm bg-gray-500" />
                        <div className="animate-piece-scatter-3 pointer-events-none absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-sm bg-gray-400" />
                    </>
                )}

                {/* Ring effect when saved */}
                {isAnimating && (
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="animate-ring-expand h-8 w-8 rounded-full border-2 border-blue-300 opacity-0" />
                    </div>
                )}
            </div>
        </Button>
    );
}

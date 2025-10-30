import { cn } from '@/lib/utils';
import { VideoPlayer } from './VideoPlayer';
import { PostMedia } from './type';

interface PostMediaGridProps {
    media: PostMedia[];
}

export function PostMediaGrid({ media }: PostMediaGridProps) {
    if (!media.length) return null;

    return (
        <div
            className={cn(
                'mt-3 grid gap-1 overflow-hidden rounded-2xl',
                media.length === 1 && 'grid-cols-1',
                media.length >= 2 && 'grid-cols-2',
            )}
        >
            {media.map((item, index) => (
                <div
                    key={item.id}
                    className={cn(
                        'relative bg-muted',
                        media.length === 1 && 'aspect-video',
                        media.length >= 2 && 'aspect-square',
                        media.length === 3 && index === 0 && 'row-span-2',
                    )}
                >
                    {item.type === 'video' ? (
                        <VideoPlayer
                            url={item.url}
                            thumbnail={item.thumbnail || item.thumbnail_url}
                            duration={item.duration}
                        />
                    ) : (
                        <img
                            src={item.url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

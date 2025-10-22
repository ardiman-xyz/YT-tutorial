import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { PostMedia } from '../types';

export function PostMediaGrid({ media }: { media: PostMedia[] }) {
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
                    {item.type === 'image' ? (
                        <img
                            src={item.url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="relative h-full w-full">
                            <img
                                src={item.thumbnail || item.url}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="rounded-full bg-black/70 p-3">
                                    <Play className="h-6 w-6 fill-white text-white" />
                                </div>
                            </div>
                            {item.duration && (
                                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                                    {item.duration}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

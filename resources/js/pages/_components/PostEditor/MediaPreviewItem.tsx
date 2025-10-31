import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { MediaFile } from './types';
import { VideoPreview } from './VideoPreview';

interface MediaPreviewItemProps {
    media: MediaFile;
    index: number;
    totalFiles: number;
    onRemove: (index: number) => void;
}

export function MediaPreviewItem({
    media,
    index,
    totalFiles,
    onRemove,
}: MediaPreviewItemProps) {
    const maxHeight = totalFiles === 1 ? '400px' : '200px';

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl bg-muted',
                totalFiles === 3 && index === 0 && 'row-span-2',
            )}
        >
            {media.type === 'image' ? (
                <img
                    src={media.preview}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    style={{ maxHeight }}
                />
            ) : (
                <VideoPreview media={media} />
            )}

            {!media.isUploading && (
                <Button
                    onClick={() => onRemove(index)}
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                >
                    <X className="h-4 w-4 text-white" />
                </Button>
            )}
        </div>
    );
}

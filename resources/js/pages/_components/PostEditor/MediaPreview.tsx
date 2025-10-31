import { cn } from '@/lib/utils';
import { MediaPreviewItem } from './MediaPreviewItem';
import { MediaFile } from './types';

interface MediaPreviewProps {
    mediaFiles: MediaFile[];
    onRemove: (index: number) => void;
}

export function MediaPreview({ mediaFiles, onRemove }: MediaPreviewProps) {
    if (mediaFiles.length === 0) return null;

    return (
        <div
            className={cn(
                'grid gap-2',
                mediaFiles.length === 1 && 'grid-cols-1',
                mediaFiles.length >= 2 && 'grid-cols-2',
            )}
        >
            {mediaFiles.map((media, index) => (
                <MediaPreviewItem
                    key={index}
                    media={media}
                    index={index}
                    totalFiles={mediaFiles.length}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}

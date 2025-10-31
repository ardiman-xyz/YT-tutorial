import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';
import { MediaFile } from './types';

interface VideoPreviewProps {
    media: MediaFile;
}

export function VideoPreview({ media }: VideoPreviewProps) {
    return (
        <div className="relative">
            <video
                src={media.preview}
                className="h-full w-full object-cover"
                style={{ maxHeight: '400px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="rounded-full bg-black/70 p-3">
                    <Play className="h-6 w-6 fill-white text-white" />
                </div>
            </div>

            {media.isUploading && (
                <div className="absolute right-0 bottom-0 left-0 bg-black/80 p-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white">
                            <span>Uploading...</span>
                            <span className="font-semibold">
                                {media.uploadProgress || 0}%
                            </span>
                        </div>
                        <Progress
                            value={media.uploadProgress || 0}
                            className="h-2"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Calendar02Icon,
    Happy01Icon,
    Image02Icon,
    LeftToRightListTriangleIcon,
    Location01Icon,
    VideoReplayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface EditorActionsProps {
    hasVideo: boolean;
    hasMaxImages: boolean;
    hasAnyMedia: boolean;
    onImageUpload: () => void;
    onVideoUpload: () => void;
}

interface Action {
    icon: any;
    tooltip: string;
    onClick: () => void;
    disabled: boolean;
}

export function EditorActions({
    hasVideo,
    hasMaxImages,
    hasAnyMedia,
    onImageUpload,
    onVideoUpload,
}: EditorActionsProps) {
    const actions: Action[] = [
        {
            icon: Image02Icon,
            tooltip: 'Add images (max 4)',
            onClick: onImageUpload,
            disabled: hasMaxImages || hasVideo,
        },
        {
            icon: VideoReplayIcon,
            tooltip: 'Add video (max 1GB)',
            onClick: onVideoUpload,
            disabled: hasAnyMedia,
        },
        {
            icon: LeftToRightListTriangleIcon,
            tooltip: 'Create poll',
            onClick: () => {},
            disabled: true,
        },
        {
            icon: Happy01Icon,
            tooltip: 'Add emoji',
            onClick: () => {},
            disabled: true,
        },
        {
            icon: Calendar02Icon,
            tooltip: 'Schedule post',
            onClick: () => {},
            disabled: true,
        },
        {
            icon: Location01Icon,
            tooltip: 'Add location',
            onClick: () => {},
            disabled: true,
        },
    ];

    return (
        <div className="-ml-2 flex items-center">
            <TooltipProvider>
                {actions.map(({ icon, tooltip, onClick, disabled }) => (
                    <Tooltip key={tooltip}>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onClick}
                                variant="ghost"
                                size="icon"
                                disabled={disabled}
                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                            >
                                <HugeiconsIcon
                                    icon={icon}
                                    size={20}
                                    color="currentColor"
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}

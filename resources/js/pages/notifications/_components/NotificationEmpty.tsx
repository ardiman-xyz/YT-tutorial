import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function NotificationEmpty({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="p-8 text-center">
            <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-muted p-4">
                    <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={24}
                        color="currentColor"
                        className="text-blue-500"
                    />
                </div>
            </div>
            <p className="text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

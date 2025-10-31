import { cn } from '@/lib/utils';

interface CharacterCounterProps {
    remaining: number;
    percentage: number;
    strokeColor: string;
}

export function CharacterCounter({
    remaining,
    percentage,
    strokeColor,
}: CharacterCounterProps) {
    const radius = 12;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90">
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted-foreground/20"
                />
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - percentage / 100)}
                    className="transition-all duration-200"
                />
            </svg>
            {remaining <= 20 && (
                <span
                    className={cn(
                        'absolute inset-0 flex items-center justify-center text-xs font-medium',
                        remaining < 0 && 'text-destructive',
                        remaining >= 0 && remaining < 20 && 'text-amber-500',
                    )}
                >
                    {remaining}
                </span>
            )}
        </div>
    );
}

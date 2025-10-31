import { cn } from '@/lib/utils';
import { TabType } from './types';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    const tabs: Array<{ value: TabType; label: string }> = [
        { value: 'for-you', label: 'For you' },
        { value: 'following', label: 'Following' },
    ];

    return (
        <div className="flex border-b">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className="relative flex-1 py-4 text-center font-semibold transition-colors hover:bg-muted/50"
                >
                    <span
                        className={cn(
                            activeTab === tab.value
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                        )}
                    >
                        {tab.label}
                    </span>
                    {activeTab === tab.value && (
                        <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            ))}
        </div>
    );
}

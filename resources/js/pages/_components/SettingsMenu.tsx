import { Check, Download } from 'lucide-react';
import { PLAYBACK_SPEEDS, VIDEO_QUALITIES } from './constant';

interface SettingsMenuProps {
    showSettings: boolean;
    showSpeedMenu: boolean;
    showQualityMenu: boolean;
    playbackSpeed: number;
    videoQuality: string;
    onSpeedClick: () => void;
    onQualityClick: () => void;
    onDownloadClick: (e: React.MouseEvent) => void;
    onSpeedChange: (speed: number) => void;
    onQualityChange: (quality: string) => void;
    onBackClick: () => void;
}

export function SettingsMenu({
    showSettings,
    showSpeedMenu,
    showQualityMenu,
    playbackSpeed,
    videoQuality,
    onSpeedClick,
    onQualityClick,
    onDownloadClick,
    onSpeedChange,
    onQualityChange,
    onBackClick,
}: SettingsMenuProps) {
    if (!showSettings) return null;

    return (
        <div
            className="absolute right-0 bottom-full mb-2 min-w-[200px] overflow-hidden rounded-lg bg-black/95 shadow-lg"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Main menu */}
            {!showSpeedMenu && !showQualityMenu && (
                <div className="py-1">
                    {/* Playback speed */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSpeedClick();
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                            <span>Playback speed</span>
                        </div>
                        <span className="text-white/60">{playbackSpeed}x</span>
                    </button>

                    {/* Video quality */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onQualityClick();
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-4 w-4 items-center justify-center">
                                <div className="h-2.5 w-3 rounded-sm border border-white" />
                            </div>
                            <span>Video quality</span>
                        </div>
                        <span className="text-white/60 capitalize">
                            {videoQuality === 'auto'
                                ? 'Auto'
                                : `${videoQuality}p`}
                        </span>
                    </button>

                    {/* Download */}
                    <button
                        onClick={onDownloadClick}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download video</span>
                    </button>
                </div>
            )}

            {/* Playback speed submenu */}
            {showSpeedMenu && (
                <div className="py-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBackClick();
                        }}
                        className="w-full border-b border-white/10 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                            key={speed}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSpeedChange(speed);
                            }}
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                        >
                            <span>{speed}x</span>
                            {playbackSpeed === speed && (
                                <Check className="h-4 w-4" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Quality submenu */}
            {showQualityMenu && (
                <div className="py-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBackClick();
                        }}
                        className="w-full border-b border-white/10 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    {VIDEO_QUALITIES.map((quality) => (
                        <button
                            key={quality.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                onQualityChange(quality.value);
                            }}
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                        >
                            <span>{quality.label}</span>
                            {videoQuality === quality.value && (
                                <Check className="h-4 w-4" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

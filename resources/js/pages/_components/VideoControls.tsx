import { cn, formatTime } from '@/lib/utils';
import {
    Maximize2,
    Minimize2,
    Pause,
    Play,
    Settings,
    Volume2,
    VolumeX,
} from 'lucide-react';

interface VideoControlsProps {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTime: number;
    totalDuration: number;
    isFullscreen: boolean;
    showControls: boolean;
    playbackSpeed: number;
    videoQuality: string;
    showSettings: boolean;
    onPlayPause: () => void;
    onMuteToggle: (e: React.MouseEvent) => void;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    onFullscreenToggle: (e: React.MouseEvent) => void;
    onSettingsToggle: (e: React.MouseEvent) => void;
}

export function VideoControls({
    isPlaying,
    isMuted,
    volume,
    currentTime,
    totalDuration,
    isFullscreen,
    showControls,
    showSettings,
    onPlayPause,
    onMuteToggle,
    onVolumeChange,
    onSeek,
    onFullscreenToggle,
    onSettingsToggle,
}: VideoControlsProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 transition-opacity duration-300',
                isPlaying && !showControls && 'pointer-events-none opacity-0',
            )}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />

            {/* Bottom controls */}
            <div className="absolute right-0 bottom-0 left-0 space-y-2 p-4">
                {/* Progress bar */}
                {totalDuration > 0 && (
                    <div
                        className="group/progress h-1.5 w-full cursor-pointer rounded-full bg-white/30 transition-all hover:h-2"
                        onClick={onSeek}
                    >
                        <div
                            className="relative h-full rounded-full bg-white"
                            style={{
                                width: `${(currentTime / totalDuration) * 100}%`,
                            }}
                        >
                            <div className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover/progress:opacity-100" />
                        </div>
                    </div>
                )}

                {/* Control buttons */}
                <div className="flex items-center justify-between text-white">
                    {/* Left side controls */}
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={onPlayPause}
                            className="transition-transform hover:scale-110"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 fill-white" />
                            ) : (
                                <Play className="h-6 w-6 fill-white" />
                            )}
                        </button>

                        {/* Volume */}
                        <div className="group/volume flex items-center gap-2">
                            <button
                                onClick={onMuteToggle}
                                className="transition-transform hover:scale-110"
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-5 w-5" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </button>

                            {/* Volume slider */}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={onVolumeChange}
                                className="w-0 opacity-0 transition-all group-hover/volume:w-20 group-hover/volume:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Time */}
                        {totalDuration > 0 && (
                            <span className="text-sm font-medium">
                                {formatTime(currentTime)} /{' '}
                                {formatTime(totalDuration)}
                            </span>
                        )}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                        {/* Settings button */}
                        <button
                            onClick={onSettingsToggle}
                            className="transition-transform hover:scale-110"
                            title="Settings"
                        >
                            <Settings
                                className={cn(
                                    'h-5 w-5 transition-transform',
                                    showSettings && 'rotate-90',
                                )}
                            />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={onFullscreenToggle}
                            className="transition-transform hover:scale-110"
                            title={
                                isFullscreen ? 'Exit fullscreen' : 'Fullscreen'
                            }
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-5 w-5" />
                            ) : (
                                <Maximize2 className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

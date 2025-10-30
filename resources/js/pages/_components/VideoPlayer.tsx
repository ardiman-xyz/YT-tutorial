import { Play } from 'lucide-react';
import { SettingsMenu } from './SettingsMenu';

import { useVideoPlayer } from '@/hooks/use-video-player';
import { VideoControls } from './VideoControls';
import { VideoPlayerProps } from './type';

export function VideoPlayer({ url, thumbnail, duration }: VideoPlayerProps) {
    const { videoRef, containerRef, videoState, settingsState, handlers } =
        useVideoPlayer(url);

    return (
        <div
            ref={containerRef}
            className="group relative h-full w-full bg-black"
            onMouseMove={handlers.handleMouseMove}
            onMouseLeave={() => {
                if (videoState.isPlaying && !settingsState.showSettings) {
                    // Will auto-hide via timeout in hook
                }
            }}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                src={url}
                poster={thumbnail}
                className="h-full w-full object-contain"
                onTimeUpdate={handlers.handleTimeUpdate}
                onLoadedMetadata={handlers.handleLoadedMetadata}
                onEnded={handlers.handleEnded}
                playsInline
                preload="metadata"
                onClick={handlers.handlePlayPause}
            />

            {/* Big play button - centered when not playing */}
            {!videoState.isPlaying && (
                <div
                    className="absolute inset-0 flex cursor-pointer items-center justify-center"
                    onClick={handlers.handlePlayPause}
                >
                    <div className="rounded-full bg-black/80 p-5 transition-transform hover:scale-110 hover:bg-black/90">
                        <Play className="h-10 w-10 fill-white text-white" />
                    </div>
                </div>
            )}

            {/* Video controls */}
            <VideoControls
                isPlaying={videoState.isPlaying}
                isMuted={videoState.isMuted}
                volume={videoState.volume}
                currentTime={videoState.currentTime}
                totalDuration={videoState.totalDuration}
                isFullscreen={videoState.isFullscreen}
                showControls={videoState.showControls}
                playbackSpeed={videoState.playbackSpeed}
                videoQuality={videoState.videoQuality}
                showSettings={settingsState.showSettings}
                onPlayPause={handlers.handlePlayPause}
                onMuteToggle={handlers.toggleMute}
                onVolumeChange={handlers.handleVolumeChange}
                onSeek={handlers.handleSeek}
                onFullscreenToggle={handlers.toggleFullscreen}
                onSettingsToggle={handlers.toggleSettings}
            />

            {/* Settings menu */}
            <div className="absolute right-4 bottom-16">
                <SettingsMenu
                    showSettings={settingsState.showSettings}
                    showSpeedMenu={settingsState.showSpeedMenu}
                    showQualityMenu={settingsState.showQualityMenu}
                    playbackSpeed={videoState.playbackSpeed}
                    videoQuality={videoState.videoQuality}
                    onSpeedClick={() => handlers.setShowSpeedMenu(true)}
                    onQualityClick={() => handlers.setShowQualityMenu(true)}
                    onDownloadClick={handlers.handleDownload}
                    onSpeedChange={handlers.handleSpeedChange}
                    onQualityChange={handlers.handleQualityChange}
                    onBackClick={() => {
                        handlers.setShowSpeedMenu(false);
                        handlers.setShowQualityMenu(false);
                    }}
                />
            </div>

            {/* Duration badge - shown when not playing */}
            {!videoState.isPlaying &&
                duration &&
                videoState.totalDuration === 0 && (
                    <div className="absolute bottom-4 left-4 rounded bg-black/80 px-2 py-1 text-sm font-medium text-white">
                        {duration}
                    </div>
                )}
        </div>
    );
}

import { RefObject, useEffect, useRef, useState } from 'react';

import { captureVideoState, restoreVideoState } from '@/lib/utils';
import {
    AUTO_HIDE_DELAY,
    DEFAULT_PLAYBACK_SPEED,
    DEFAULT_VIDEO_QUALITY,
} from '@/pages/_components/constant';
import { SettingsState, VideoState } from '@/pages/_components/type';

interface UseVideoPlayerReturn {
    videoRef: RefObject<HTMLVideoElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
    videoState: VideoState;
    settingsState: SettingsState;
    handlers: {
        handlePlayPause: (e?: React.MouseEvent) => void;
        toggleMute: (e: React.MouseEvent) => void;
        handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
        toggleFullscreen: (e: React.MouseEvent) => void;
        toggleSettings: (e: React.MouseEvent) => void;
        handleSpeedChange: (speed: number) => void;
        handleQualityChange: (quality: string) => void;
        handleDownload: (e: React.MouseEvent) => void;
        handleTimeUpdate: () => void;
        handleLoadedMetadata: () => void;
        handleEnded: () => void;
        handleMouseMove: () => void;
        setShowSpeedMenu: (show: boolean) => void;
        setShowQualityMenu: (show: boolean) => void;
    };
}

export function useVideoPlayer(url: string): UseVideoPlayerReturn {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Video state
    const [videoState, setVideoState] = useState<VideoState>({
        isPlaying: false,
        isMuted: true,
        volume: 1,
        currentTime: 0,
        totalDuration: 0,
        isFullscreen: false,
        showControls: true,
        playbackSpeed: DEFAULT_PLAYBACK_SPEED,
        videoQuality: DEFAULT_VIDEO_QUALITY,
    });

    // Settings state
    const [settingsState, setSettingsState] = useState<SettingsState>({
        showSettings: false,
        showSpeedMenu: false,
        showQualityMenu: false,
    });

    // Play/Pause
    const handlePlayPause = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (videoRef.current) {
            if (videoState.isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setVideoState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        }
    };

    // Mute/Unmute
    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            const newMutedState = !videoState.isMuted;
            videoRef.current.muted = newMutedState;
            setVideoState((prev) => ({
                ...prev,
                isMuted: newMutedState,
                volume: newMutedState ? 0 : videoRef.current!.volume,
            }));
        }
    };

    // Volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVideoState((prev) => ({
                ...prev,
                volume: newVolume,
                isMuted: newVolume === 0,
            }));
        }
    };

    // Seek
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (videoRef.current && videoState.totalDuration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const newTime = percentage * videoState.totalDuration;
            videoRef.current.currentTime = newTime;
            setVideoState((prev) => ({ ...prev, currentTime: newTime }));
        }
    };

    // Fullscreen
    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setVideoState((prev) => ({ ...prev, isFullscreen: true }));
        } else {
            document.exitFullscreen();
            setVideoState((prev) => ({ ...prev, isFullscreen: false }));
        }
    };

    // Settings menu
    const toggleSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSettingsState((prev) => ({
            ...prev,
            showSettings: !prev.showSettings,
            showSpeedMenu: false,
            showQualityMenu: false,
        }));
    };

    // Playback speed - WITH AUDIO FIX
    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            const state = captureVideoState(videoRef.current);
            videoRef.current.playbackRate = speed;

            // Preserve audio state (critical!)
            videoRef.current.volume = state.volume;
            videoRef.current.muted = state.isMuted;

            if (state.isPlaying) {
                videoRef.current.play().catch((err) => {
                    console.log('Playback failed:', err);
                });
            }
        }

        setVideoState((prev) => ({ ...prev, playbackSpeed: speed }));
        setSettingsState({
            showSettings: false,
            showSpeedMenu: false,
            showQualityMenu: false,
        });
    };

    // Video quality
    const handleQualityChange = (quality: string) => {
        if (videoRef.current) {
            const state = captureVideoState(videoRef.current);

            // In production: change video source here
            // videoRef.current.src = getQualityUrl(quality);

            restoreVideoState(videoRef.current, state);
        }

        setVideoState((prev) => ({ ...prev, videoQuality: quality }));
        setSettingsState({
            showSettings: false,
            showSpeedMenu: false,
            showQualityMenu: false,
        });
    };

    // Download
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = url;
        link.download = 'video.mp4';
        link.click();
        setSettingsState({
            showSettings: false,
            showSpeedMenu: false,
            showQualityMenu: false,
        });
    };

    // Time update
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setVideoState((prev) => ({
                ...prev,
                currentTime: videoRef.current!.currentTime,
            }));
        }
    };

    // Loaded metadata
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setVideoState((prev) => ({
                ...prev,
                totalDuration: videoRef.current!.duration,
            }));
        }
    };

    // Video ended
    const handleEnded = () => {
        setVideoState((prev) => ({
            ...prev,
            isPlaying: false,
            showControls: true,
        }));
    };

    // Mouse move - show controls
    const handleMouseMove = () => {
        setVideoState((prev) => ({ ...prev, showControls: true }));

        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }

        if (videoState.isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                if (
                    !settingsState.showSettings &&
                    !settingsState.showSpeedMenu &&
                    !settingsState.showQualityMenu
                ) {
                    setVideoState((prev) => ({ ...prev, showControls: false }));
                }
            }, AUTO_HIDE_DELAY);
        }
    };

    // Initialize
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = true;
            video.volume = 1;
            video.playbackRate = videoState.playbackSpeed;

            video.addEventListener('loadedmetadata', () => {
                video.volume = 1;
            });
        }

        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, [videoState.playbackSpeed]);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setSettingsState({
                showSettings: false,
                showSpeedMenu: false,
                showQualityMenu: false,
            });
        };

        if (
            settingsState.showSettings ||
            settingsState.showSpeedMenu ||
            settingsState.showQualityMenu
        ) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [settingsState]);

    return {
        videoRef,
        containerRef,
        videoState,
        settingsState,
        handlers: {
            handlePlayPause,
            toggleMute,
            handleVolumeChange,
            handleSeek,
            toggleFullscreen,
            toggleSettings,
            handleSpeedChange,
            handleQualityChange,
            handleDownload,
            handleTimeUpdate,
            handleLoadedMetadata,
            handleEnded,
            handleMouseMove,
            setShowSpeedMenu: (show) =>
                setSettingsState((prev) => ({ ...prev, showSpeedMenu: show })),
            setShowQualityMenu: (show) =>
                setSettingsState((prev) => ({
                    ...prev,
                    showQualityMenu: show,
                })),
        },
    };
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatNumber = (n: number) =>
    n >= 1_000_000
        ? (n / 1_000_000).toFixed(1) + 'M'
        : n >= 1_000
          ? (n / 1_000).toFixed(1) + 'K'
          : n.toString();

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate seek position from click event
 */
export function calculateSeekPosition(
    e: React.MouseEvent<HTMLDivElement>,
    totalDuration: number,
): number {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    return percentage * totalDuration;
}

/**
 * Preserve and restore video state
 */
export interface VideoStateSnapshot {
    currentTime: number;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
}

export function captureVideoState(video: HTMLVideoElement): VideoStateSnapshot {
    return {
        currentTime: video.currentTime,
        isPlaying: !video.paused,
        volume: video.volume,
        isMuted: video.muted,
        playbackRate: video.playbackRate,
    };
}

export function restoreVideoState(
    video: HTMLVideoElement,
    state: VideoStateSnapshot,
): void {
    video.currentTime = state.currentTime;
    video.volume = state.volume;
    video.muted = state.isMuted;
    video.playbackRate = state.playbackRate;

    if (state.isPlaying) {
        video.play().catch((err) => {
            console.log('Playback failed:', err);
        });
    }
}

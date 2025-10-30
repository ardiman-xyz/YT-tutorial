export const PLAYBACK_SPEEDS = [
    0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
] as const;

export const VIDEO_QUALITIES = [
    { label: 'Auto', value: 'auto' },
    { label: '2160p', value: '2160' },
    { label: '1080p', value: '1080' },
    { label: '720p', value: '720' },
    { label: '480p', value: '480' },
    { label: '360p', value: '360' },
] as const;

export const DEFAULT_PLAYBACK_SPEED = 1;
export const DEFAULT_VIDEO_QUALITY = 'auto';
export const AUTO_HIDE_DELAY = 3000;

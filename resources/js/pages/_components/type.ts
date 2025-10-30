export interface PostMedia {
    id: number;
    url: string;
    type: 'image' | 'video' | 'gif';
    thumbnail?: string;
    thumbnail_url?: string;
    duration?: string;
}

export interface VideoPlayerProps {
    url: string;
    thumbnail?: string;
    duration?: string;
}

export interface VideoQuality {
    label: string;
    value: string;
}

export interface VideoState {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTime: number;
    totalDuration: number;
    isFullscreen: boolean;
    showControls: boolean;
    playbackSpeed: number;
    videoQuality: string;
}

export interface SettingsState {
    showSettings: boolean;
    showSpeedMenu: boolean;
    showQualityMenu: boolean;
}

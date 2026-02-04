export interface ElectronAPI {
    getSignalingInfo: () => Promise<{ urls: string[]; port: number }>;
    getPeerCount: () => Promise<number>;
    onSignalingUrls: (callback: (urls: string[]) => void) => void;
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

export { };

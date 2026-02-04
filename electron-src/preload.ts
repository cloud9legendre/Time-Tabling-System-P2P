import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // P2P / Signaling
    getSignalingInfo: () => ipcRenderer.invoke('get-signaling-info'),
    getPeerCount: () => ipcRenderer.invoke('get-peer-count'),

    // Event listeners (Multi-server mesh)
    onSignalingUrls: (callback: (urls: string[]) => void) => {
        ipcRenderer.on('signaling-urls', (_event, urls) => callback(urls));
    },

    // Cleanup
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

import React, { useEffect, useState, useMemo } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { seedData } from '../utils/seedData';
import { YjsContext } from './YjsContext';

import { initializeLogSilencer } from '../utils/logSilencer';

// Check if running in Electron
declare global {
    interface Window {
        electronAPI?: {
            onSignalingUrls: (callback: (urls: string[]) => void) => void;
            getSignalingInfo: () => Promise<{ urls: string[] }>;
        }
    }
}
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export const YjsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize P2P log silencing
    useEffect(() => {
        initializeLogSilencer();
    }, []);

    const [yDoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<WebrtcProvider | WebsocketProvider | null>(null);
    const [connected, setConnected] = useState(false);
    const [peerCount, setPeerCount] = useState(0);

    const awareness = useMemo(() => provider?.awareness || null, [provider]);

    // Initialize with default for browser, empty for Electron (to be populated)
    const [signalingUrls, setSignalingUrls] = useState<string[]>(() => {
        if (isElectron) return [];
        return ['wss://demos.yjs.dev/ws'];
    });

    // Listen for signaling URLs from Electron main process
    useEffect(() => {
        if (isElectron && window.electronAPI) {
            // Listen for URL updates
            window.electronAPI.onSignalingUrls((urls: string[]) => {
                console.log('📡 Received signaling URLs from Electron:', urls);
                setSignalingUrls(urls);
            });

            // Pull initial state
            window.electronAPI.getSignalingInfo().then((info: { urls: string[] }) => {
                if (info.urls && info.urls.length > 0) {
                    console.log('📡 Pulled signaling info from Electron:', info);
                    setSignalingUrls(info.urls);
                }
            });
        }
    }, []);

    // Create provider when signaling URLs change
    useEffect(() => {
        if (signalingUrls.length === 0) return;

        console.log('🔄 Creating provider with signaling URLs:', signalingUrls);

        let syncProvider: WebrtcProvider | WebsocketProvider;

        if (isElectron) {
            console.log('🖥️ Running in Electron mode with', signalingUrls.length, 'signaling servers');
            syncProvider = new WebrtcProvider('lab-timetable-mesh', yDoc, {
                signaling: signalingUrls
            });

            syncProvider.on('status', (event: { connected: boolean }) => {
                console.log('📡 WebRTC Status:', event.connected ? 'Connected' : 'Disconnected');
                setConnected(event.connected);
            });
        } else {
            console.log('🌐 Running in Browser mode with WebSocket:', signalingUrls[0]);
            syncProvider = new WebsocketProvider(
                signalingUrls[0],
                'lab-timetable-sync-v9',
                yDoc
            );

            syncProvider.on('status', (event: { status: string }) => {
                console.log('📡 WebSocket Status:', event.status);
                setConnected(event.status === 'connected');
            });
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProvider(syncProvider);

        return () => {
            console.log('🔌 YjsProvider: Cleaning up provider...');
            syncProvider.destroy();
        };
    }, [yDoc, signalingUrls]);

    // Handle Peer Count using derived awareness
    useEffect(() => {
        if (!awareness) return;

        const updatePeers = () => {
            const count = awareness.getStates().size;
            console.log(`👥 Awareness update: ${count} total clients (${count - 1} peers)`);
            setPeerCount(count > 0 ? count - 1 : 0);
        };

        awareness.on('change', updatePeers);
        updatePeers();

        return () => {
            awareness.off('change', updatePeers);
        };
    }, [awareness]);

    // Initialize IndexedDB Persistence (Effect dependent only on yDoc)
    useEffect(() => {
        // Use a random suffix to allow multiple local instances to run without DB locking conflicts
        // In production, you might want a fixed name, but for local P2P testing on one machine, this is essential.
        const sessionSuffix = Math.random().toString(36).substring(7);
        const dbName = `lab-timetable-mesh-v1-${sessionSuffix}`;

        let indexeddbProvider: IndexeddbPersistence;
        try {
            indexeddbProvider = new IndexeddbPersistence(dbName, yDoc);

            indexeddbProvider.on('synced', () => {
                console.log(`✅ Content from IndexedDB (${dbName}) is loaded`);
                seedData(yDoc);
            });
        } catch (err) {
            console.warn('⚠️ Failed to initialize IndexedDB:', err);
            return;
        }

        return () => {
            indexeddbProvider.destroy();
        };
    }, [yDoc]);

    return (
        <YjsContext.Provider value={{ yDoc, connected, provider, awareness, peerCount, signalingUrls }}>
            {children}
        </YjsContext.Provider>
    );
};

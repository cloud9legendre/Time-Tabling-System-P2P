import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { seedData } from '../utils/seedData';

interface YjsContextType {
    yDoc: Y.Doc;
    connected: boolean;
    provider: WebrtcProvider | null;
}

const YjsContext = createContext<YjsContextType | null>(null);

export const YjsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [yDoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<WebrtcProvider | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // 1. Initialize WebRTC Provider (Sync with peers)
        // Using a fixed room name for this lab system
        const webRtcProvider = new WebrtcProvider('lab-timetabling-p2p-v1', yDoc, {
            signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
        });

        // 2. Initialize IndexedDB Persistence (Offline support)
        const indexeddbProvider = new IndexeddbPersistence('lab-timetabling-p2p-v1', yDoc);

        indexeddbProvider.on('synced', () => {
            console.log('Content from IndexedDB is loaded');
            seedData(yDoc);
        });

        webRtcProvider.on('status', (event: { connected: boolean }) => {
            setConnected(event.connected);
        });

        setProvider(webRtcProvider);

        return () => {
            webRtcProvider.destroy();
            indexeddbProvider.destroy();
            yDoc.destroy();
        };
    }, [yDoc]);

    return (
        <YjsContext.Provider value={{ yDoc, connected, provider }}>
            {children}
        </YjsContext.Provider>
    );
};

export const useYjs = () => {
    const context = useContext(YjsContext);
    if (!context) {
        throw new Error('useYjs must be used within a YjsProvider');
    }
    return context;
};

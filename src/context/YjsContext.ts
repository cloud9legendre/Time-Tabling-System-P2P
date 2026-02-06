import { createContext } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import type { Awareness } from 'y-protocols/awareness';

export interface YjsContextType {
    yDoc: Y.Doc;
    connected: boolean;
    provider: WebrtcProvider | WebsocketProvider | null;
    awareness: Awareness | null;
    peerCount: number;
    signalingUrls: string[];
    authToken?: string | null;  // This is the Invite Code
    joinNetwork?: (code: string) => Promise<void>;
    resetNetwork?: () => Promise<void>;
}

export const YjsContext = createContext<YjsContextType | null>(null);

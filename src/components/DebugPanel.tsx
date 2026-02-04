import React, { useEffect, useState } from 'react';
import { useYjs } from '../hooks/useYjs';
import { useAuth } from '../hooks/useAuth';

export const DebugPanel: React.FC = () => {
    const { yDoc, connected, provider, awareness, peerCount, signalingUrls } = useYjs();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [roomId] = useState('lab-timetable-mesh');
    const [signalingState, setSignalingState] = useState('Unknown');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [awarenessStates, setAwarenessStates] = useState<any[]>([]);

    useEffect(() => {
        if (provider) {
            const checkSignaling = () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const p = provider as any;
                    if (p.wsconnected !== undefined) {
                        setSignalingState(p.wsconnected ? 'Connected' : 'Disconnected');
                    } else if (p.connected !== undefined) {
                        setSignalingState(p.connected ? 'Connected' : 'Disconnected');
                    } else {
                        setSignalingState(connected ? 'Connected' : 'Checking...');
                    }
                } catch {
                    setSignalingState('Error');
                }
            };

            checkSignaling();
            const interval = setInterval(checkSignaling, 1000);
            return () => clearInterval(interval);
        }
    }, [provider, connected]);

    useEffect(() => {
        if (!awareness) return;

        const updateAwareness = () => {
            const states: unknown[] = [];
            awareness.getStates().forEach((state, clientId) => {
                states.push({ clientId, ...state });
            });
            setAwarenessStates(states);
        };

        updateAwareness();
        awareness.on('change', updateAwareness);
        return () => awareness.off('change', updateAwareness);
    }, [awareness]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 px-3 py-1.5 bg-gray-900 text-gray-400 text-xs rounded border border-gray-700 hover:bg-gray-800 hover:text-gray-200 transition-colors z-40"
            >
                🔧 Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 w-96 max-h-[600px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-40">
            {/* Header */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-200">🔧 Debug Panel (Mesh)</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[540px] space-y-4">
                {/* Connection Status */}
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">Connection Status</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">WebRTC:</span>
                            <span className={connected ? 'text-green-400' : 'text-red-400'}>
                                {connected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Peers:</span>
                            <span className="text-gray-300">{peerCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Signaling:</span>
                            <span className="text-gray-300">{signalingState}</span>
                        </div>
                    </div>
                </div>

                {/* Mesh Signaling Servers */}
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">
                        🕸️ Mesh Signaling Servers ({signalingUrls.length})
                    </h4>
                    <div className="space-y-1">
                        {signalingUrls.length === 0 ? (
                            <div className="text-gray-600 text-xs italic">Discovering servers...</div>
                        ) : (
                            signalingUrls.map((url, idx) => (
                                <div key={url} className="flex items-center gap-2 text-xs">
                                    <span className="text-green-400">●</span>
                                    <span className="text-gray-400 font-mono truncate">{url}</span>
                                    {idx === 0 && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">
                                            Own
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Room Info */}
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">Room Info</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Room ID:</span>
                            <span className="text-gray-300 font-mono truncate ml-2">{roomId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Your Key:</span>
                            <span className="text-gray-300 font-mono truncate ml-2">
                                {user?.publicKey.substring(0, 12)}...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Awareness States */}
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">Awareness States ({awarenessStates.length})</h4>
                    <div className="space-y-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {awarenessStates.map((state: { clientId: number; user?: any }) => (
                            <div key={state.clientId} className="bg-gray-900 p-2 rounded text-xs">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-500">Client #{state.clientId}</span>
                                    {state.user && (
                                        <span className="text-green-400 text-[10px]">● Active</span>
                                    )}
                                </div>
                                {state.user ? (
                                    <div className="text-gray-300">
                                        <div><strong>Name:</strong> {state.user.name}</div>
                                        <div className="truncate"><strong>Key:</strong> {state.user.publicKey?.substring(0, 20)}...</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 italic">No user data</div>
                                )}
                            </div>
                        ))}
                        {awarenessStates.length === 0 && (
                            <div className="text-gray-600 text-xs italic">No awareness states detected</div>
                        )}
                    </div>
                </div>

                {/* Yjs Doc Stats */}
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">Yjs Document</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Bookings:</span>
                            <span className="text-gray-300">{yDoc.getMap('bookings').size}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Users:</span>
                            <span className="text-gray-300">{yDoc.getMap('users').size}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Labs:</span>
                            <span className="text-gray-300">{yDoc.getMap('labs').size}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Modules:</span>
                            <span className="text-gray-300">{yDoc.getMap('modules').size}</span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
                    <h4 className="text-xs font-bold text-green-400 mb-1">🕸️ Mesh Architecture</h4>
                    <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                        <li>Every peer runs its own signaling server</li>
                        <li>All peers connect to ALL discovered servers</li>
                        <li>If any peer quits, others keep working</li>
                        <li>No leader election needed!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

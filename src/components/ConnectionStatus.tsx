import React, { useEffect, useState } from 'react';
import { useYjs } from '../hooks/useYjs';
import { useAuth } from '../hooks/useAuth';

interface OnlineUser {
    clientId: number;
    name: string;
    publicKey: string;
}

export const ConnectionStatus: React.FC = () => {
    const { connected, awareness, peerCount } = useYjs();
    const { isAdmin, loginAsAdmin, user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [showOnlineList, setShowOnlineList] = useState(false);

    useEffect(() => {
        if (!awareness) return;

        const updateOnlineUsers = () => {
            const users: OnlineUser[] = [];
            const states = awareness.getStates();

            states.forEach((state, clientId) => {
                if (state.user) {
                    users.push({
                        clientId,
                        name: state.user.name || 'Anonymous',
                        publicKey: state.user.publicKey || ''
                    });
                }
            });

            setOnlineUsers(users);
        };

        updateOnlineUsers();
        awareness.on('change', updateOnlineUsers);

        return () => {
            awareness.off('change', updateOnlineUsers);
        };
    }, [awareness]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Online Users Dropdown */}
            {showOnlineList && onlineUsers.length > 0 && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                    <div className="p-3 bg-gray-900 border-b border-gray-700">
                        <h3 className="text-sm font-bold text-gray-200">Online Members</h3>
                        <p className="text-xs text-gray-400">{onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {onlineUsers.map((u) => {
                            const isCurrentUser = u.publicKey === user?.publicKey;
                            return (
                                <div
                                    key={u.clientId}
                                    className={`p-2.5 border-b border-gray-700/50 last:border-none ${isCurrentUser ? 'bg-blue-900/20' : 'hover:bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-sm font-medium text-gray-200">
                                            {u.name} {isCurrentUser && <span className="text-xs text-blue-400">(You)</span>}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-4 truncate">{u.publicKey.substring(0, 12)}...</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div
                onClick={() => setShowOnlineList(!showOnlineList)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 rounded-full shadow-lg border border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-200">
                        {connected ? `Online (${peerCount})` : 'Offline'}
                    </span>
                </div>

                {!isAdmin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            loginAsAdmin();
                        }}
                        className="text-xs text-gray-500 hover:text-gray-300 underline"
                        title="Switch to Admin Mode"
                    >
                        Admin
                    </button>
                )}
                {isAdmin && (
                    <span className="text-xs text-yellow-500 font-bold border border-yellow-500/30 px-1.5 py-0.5 rounded">
                        ADMIN
                    </span>
                )}
            </div>
        </div>
    );
};

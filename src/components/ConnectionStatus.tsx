import React from 'react';
import { useYjs } from '../context/YjsProvider';

export const ConnectionStatus: React.FC = () => {
    const { connected } = useYjs();

    return (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full shadow-lg border border-gray-700">
            <div
                className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'
                    }`}
            />
            <span className="text-sm font-medium text-gray-200">
                {connected ? 'P2P Connected' : 'Disconnected'}
            </span>
        </div>
    );
};

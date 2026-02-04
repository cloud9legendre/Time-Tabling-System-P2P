import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const RegistrationModal: React.FC = () => {
    const { isAuthenticated, register } = useAuth();
    const [name, setName] = useState('');

    if (isAuthenticated) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            register(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Welcome Peer</h2>
                <p className="text-gray-400 mb-6 text-center">
                    Join the decentralized lab network. Enter your display name to continue.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Dr. Strange"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                    >
                        Create Identity
                    </button>
                </form>
            </div>
        </div>
    );
};

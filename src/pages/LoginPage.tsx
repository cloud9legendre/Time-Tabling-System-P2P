import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // If already authenticated, redirect done in useEffect or parent, but just in case:
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (userId.trim() && password) {
            const success = await login(userId.trim(), password);
            if (!success) {
                setError('Invalid credentials or instructor not found.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold mb-2 text-white text-center tracking-tight">Lab P2P</h2>
                <h3 className="text-xl font-medium mb-6 text-gray-400 text-center">Secure Login</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="uid" className="block text-sm font-medium text-gray-300 mb-1">
                            User ID
                        </label>
                        <input
                            type="text"
                            id="uid"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            placeholder="e.g. inst-01 or admin"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="pass" className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="pass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-900/50">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 font-semibold rounded-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30 transition-all duration-200 mt-2"
                    >
                        Login
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        Use ID <strong>admin</strong> for system administration.
                    </p>
                </form>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import { useNavigate } from 'react-router-dom';
import type { Instructor } from '../types/schema';

export const LoginPage: React.FC = () => {
    const { isAuthenticated, login, createFirstAdmin } = useAuth();
    const { yDoc, connected, peerCount, authToken, joinNetwork, resetNetwork } = useYjs();
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [syncWarning, setSyncWarning] = useState(false);

    // Setup Flow State
    const [setupStep, setSetupStep] = useState<'welcome' | 'create' | 'join'>('welcome');
    const [inviteCode, setInviteCode] = useState('');

    // Check if admin exists
    useEffect(() => {
        if (!connected) return;

        const checkAdmin = () => {
            const instructorsMap = yDoc.getMap<Instructor>('instructors');
            const adminExists = instructorsMap.has('admin');
            setIsSetupMode(!adminExists);
            setIsLoading(false);

            // Warn if no admin and no peers connected (potential split-brain)
            if (!adminExists && peerCount === 0) {
                setSyncWarning(true);
            } else {
                setSyncWarning(false);
            }
        };

        // Initial check
        checkAdmin();

        // Listen for changes (in case admin is created on another peer)
        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        instructorsMap.observe(checkAdmin);

        return () => {
            instructorsMap.unobserve(checkAdmin);
        };
    }, [yDoc, connected, peerCount]);

    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (userId.trim() && password) {
            const success = await login(userId.trim(), password);
            if (!success) {
                setError('Invalid credentials or user not found.');
            }
        }
    };

    const handleSetupAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const success = await createFirstAdmin(password);
        if (success) {
            // Admin created, now login
            const loginSuccess = await login('admin', password);
            if (!loginSuccess) {
                setError('Admin created but login failed. Try logging in manually.');
                setIsSetupMode(false);
            }
        } else {
            setError('Failed to create admin. An admin may already exist.');
            setIsSetupMode(false);
        }
    };

    if (isLoading || !connected) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 text-center">
                    <div className="animate-pulse">
                        <h2 className="text-2xl font-bold mb-4 text-white">Connecting to P2P Network...</h2>
                        <p className="text-gray-400">Please wait while we sync with the mesh network.</p>
                    </div>
                </div>
            </div>
        );
    }



    // Setup Mode - No admin exists
    if (isSetupMode) {
        // Step 1: Welcome / Choice Screen
        if (setupStep === 'welcome') {
            return (
                <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 text-center">
                        <span className="text-4xl mb-4 block">👋</span>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome to Lab P2P</h2>
                        <p className="text-gray-400 mb-8">Get started by creating a new network or joining an existing one.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setSetupStep('create')}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                <span>🆕</span> Create New Network
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                                <div className="relative flex justify-center"><span className="bg-[#1a1a1a] px-3 text-gray-500 text-sm">OR</span></div>
                            </div>

                            <button
                                onClick={() => setSetupStep('join')}
                                className="w-full py-4 px-6 rounded-xl bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 hover:border-gray-500 text-white font-semibold shadow hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                <span>🔗</span> Join Existing Network
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Step 2: Join Network Screen
        if (setupStep === 'join') {
            return (
                <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                        <button onClick={() => setSetupStep('welcome')} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
                        <h2 className="text-2xl font-bold text-white mb-2">Join Network</h2>
                        <p className="text-gray-400 mb-6 text-sm">Ask your administrator for the Network Invite Code.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Paste code here..."
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={() => joinNetwork && inviteCode && joinNetwork(inviteCode)}
                                disabled={!inviteCode}
                                className="w-full py-3 px-4 font-semibold rounded-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Connect & Sync
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Step 3: Create Network (Admin Setup)
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-amber-700/50">
                    <button onClick={() => setSetupStep('welcome')} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
                    <div className="text-center mb-6">
                        <span className="text-4xl mb-2 block">🔐</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Setup Administrator</h2>
                        <p className="text-gray-400 mt-2">Create the first admin account for this new network.</p>
                    </div>

                    {syncWarning && (
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-4">
                            <p className="text-yellow-400 text-sm font-medium">⚠️ No peers connected</p>
                        </div>
                    )}

                    <form onSubmit={handleSetupAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Admin Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                placeholder="Choose a strong password"
                                required
                                minLength={6}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-900/50">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 font-semibold rounded-lg shadow-lg bg-amber-600 hover:bg-amber-700 text-white hover:shadow-amber-500/30 transition-all duration-200 mt-2"
                        >
                            Create Network & Login
                        </button>

                        <div className="bg-amber-900/20 p-3 rounded text-xs text-amber-200/70 text-center mt-4">
                            You will get an <strong>Invite Code</strong> to share with others after logging in.
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Normal Login Mode
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold mb-2 text-white text-center tracking-tight">Lab P2P</h2>
                <h3 className="text-xl font-medium mb-6 text-gray-400 text-center">Secure Login</h3>

                <form onSubmit={handleLogin} className="space-y-4">
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

                {/* Network Management Footer */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex flex-col gap-3">
                        <div className="bg-[#2a2a2a] p-3 rounded text-xs break-all relative group">
                            <span className="text-gray-500 uppercase font-bold text-[10px]">Current Network Invite Code</span>
                            <p className="text-gray-300 font-mono mt-1 select-all">{authToken || 'Loading...'}</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(authToken || '')}
                                className="absolute top-2 right-2 text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const code = prompt('Enter Network Invite Code to Join:');
                                    if (code && joinNetwork) joinNetwork(code);
                                }}
                                className="flex-1 py-2 px-3 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                                🔗 Join Existing Network
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to create a NEW network? You will be disconnected from the current mesh.')) {
                                        if (resetNetwork) resetNetwork();
                                    }
                                }}
                                className="flex-1 py-2 px-3 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                                🆕 Create New Network
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

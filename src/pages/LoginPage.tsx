import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import { useNavigate } from 'react-router-dom';
import type { Instructor } from '../types/schema';

export const LoginPage: React.FC = () => {
    const { isAuthenticated, login, createFirstAdmin } = useAuth();
    const { yDoc, connected, peerCount } = useYjs();
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [syncWarning, setSyncWarning] = useState(false);

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
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-amber-700/50">
                    <div className="text-center mb-6">
                        <span className="text-4xl mb-2 block">🔐</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">First Time Setup</h2>
                        <p className="text-gray-400 mt-2">No administrator found. Create one to get started.</p>
                    </div>

                    {syncWarning && (
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-4">
                            <p className="text-yellow-400 text-sm font-medium">⚠️ No peers connected</p>
                            <p className="text-yellow-500/80 text-xs mt-1">
                                If another peer already created an admin while offline, creating one here may cause a conflict.
                                Wait for peers to connect if you're unsure.
                            </p>
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
                            Create Administrator
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            This password will be used to login as the system administrator.
                        </p>
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
            </div>
        </div>
    );
};

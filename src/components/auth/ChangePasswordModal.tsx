import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Lock } from 'lucide-react';

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { changePassword, requestPasswordReset } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 5) {
            setError('Password must be at least 5 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await changePassword!(currentPassword, password);
            setSuccess('Password updated successfully');
            setPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setTimeout(onClose, 1500);
        } catch (err: any) {
            setError('Failed to update password: ' + err.message);
        }
    };

    const handleResetRequest = async () => {
        try {
            await requestPasswordReset!();
            setSuccess('Password reset requested. Admin has been notified.');
        } catch (err: any) {
            setError('Request failed: ' + err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lock size={20} className="text-blue-400" /> Change Password
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-900/50 text-green-200 p-2 rounded text-sm text-center">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Update Password
                    </button>

                    <div className="text-center pt-2 border-t border-gray-700 mt-4">
                        <button
                            type="button"
                            onClick={handleResetRequest}
                            className="text-xs text-yellow-500 hover:text-yellow-400 underline"
                        >
                            Forgot current password? Request Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

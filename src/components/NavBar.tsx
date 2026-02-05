import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Settings, Shield, LogOut, KeyRound } from 'lucide-react';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { useState } from 'react';

export const NavBar: React.FC = () => {
    const { isAdmin, logout } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <nav className="bg-[#2a2a2a] border-b border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Lab Timetable P2P
                </div>

                <div className="flex space-x-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-900/40 text-blue-300 pointer-events-none'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        <Calendar size={18} />
                        Timetable
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-purple-900/40 text-purple-300 pointer-events-none'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            <Shield size={18} />
                            Admin
                        </NavLink>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Settings size={14} /> Mesh Network v1.0
                </div>

                {!isAdmin && (
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors text-sm"
                        title="Change Password"
                    >
                        <KeyRound size={16} /> Change Password
                    </button>
                )}

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-md transition-colors text-sm"
                    title="Logout"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </nav>
    );
};

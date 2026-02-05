import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Settings, Shield, LogOut, KeyRound } from 'lucide-react';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { LeaveRequestPanel } from './auth/LeaveRequestPanel';
import { useState } from 'react';
import { X } from 'lucide-react';

export const NavBar: React.FC = () => {
    const { isAdmin, logout } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLeavesOpen, setIsLeavesOpen] = useState(false);

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
                    <>
                        <button
                            onClick={() => setIsLeavesOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors text-sm"
                            title="My Leaves"
                        >
                            <Calendar size={16} /> My Leaves
                        </button>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors text-sm"
                            title="Change Password"
                        >
                            <KeyRound size={16} /> Change Password
                        </button>
                    </>
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

            {isLeavesOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsLeavesOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-2">
                            <LeaveRequestPanel />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

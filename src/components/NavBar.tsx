import React from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Settings, Shield, LogOut, KeyRound } from 'lucide-react';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { LeaveRequestPanel } from './auth/LeaveRequestPanel';
import { useState } from 'react';


export const NavBar: React.FC = () => {
    const { isAdmin, logout } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLeavesOpen, setIsLeavesOpen] = useState(false);

    return (
        <nav className="bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
            {/* Left Section: Logo & Nav */}
            <div className="flex items-center gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-500">
                        <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Calendar size={18} className="text-white relative z-10" />
                    </div>
                    <div>
                        <div className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-gray-200 bg-clip-text text-transparent leading-none tracking-tight">
                            LabTime P2P
                        </div>
                        <div className="text-[10px] text-blue-400 font-mono tracking-widest uppercase opacity-80">
                            Mesh Sync Active
                        </div>
                    </div>
                </div>



                {/* Navigation Links */}
                <div className="flex space-x-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Calendar size={16} />
                        Timetable
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Shield size={16} />
                            Admin Console
                        </NavLink>
                    )}
                </div>
            </div>

            {/* Right Section: User Controls */}
            <div className="flex items-center gap-4">
                {/* Mesh Status Pill */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-xs font-medium text-emerald-400/80">
                    <Settings size={12} className="animate-spin-slow" />
                    <span>Mesh v1.0</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
                </div>



                <div className="flex items-center gap-2">
                    {!isAdmin && (
                        <>
                            <button
                                onClick={() => setIsLeavesOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 shadow-sm"
                            >
                                <Calendar size={16} className="text-blue-400 group-hover:text-blue-300" />
                                <span>Leaves</span>
                            </button>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 shadow-sm"
                            >
                                <KeyRound size={16} className="text-yellow-400 group-hover:text-yellow-300" />
                                <span>Password</span>
                            </button>
                        </>
                    )}

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-medium shadow-sm"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Modals - Portaled to look correct outside of nav's staking context */}
            {createPortal(
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />,
                document.body
            )}

            {isLeavesOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <LeaveRequestPanel onClose={() => setIsLeavesOpen(false)} />
                    </div>
                </div>,
                document.body
            )}
        </nav>
    );
};

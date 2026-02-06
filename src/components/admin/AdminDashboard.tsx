import React, { useState } from 'react';
import { LabsManager } from './LabsManager';
import { ModulesManager } from './ModulesManager';
import { InstructorsManager } from './InstructorsManager';
import { LeaveRequestsManager } from './LeaveRequestsManager';
import { useAuth } from '../../hooks/useAuth';
import { useYjs } from '../../hooks/useYjs';
import { useLeaves } from '../../hooks/useSharedState';
import { ShieldAlert, Bell, Copy, Check, Eye, EyeOff } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const { authToken } = useYjs();
    const leaves = useLeaves();
    const [activeTab, setActiveTab] = useState<'labs' | 'modules' | 'instructors' | 'leaves'>('labs');
    const [copied, setCopied] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const pendingLeavesCount = leaves.filter(l => l.status === 'PENDING').length;

    const handleCopy = () => {
        if (authToken) {
            navigator.clipboard.writeText(authToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 text-gray-400">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
                <div className="mt-4 text-sm bg-gray-800 p-3 rounded">
                    Current Role: <span className="text-blue-400 font-mono">{user?.role || 'GUEST'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-700 pb-4 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white">
                        Admin Dashboard
                    </h1>
                    {pendingLeavesCount > 0 && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 px-3 py-1 rounded-full animate-pulse">
                            <Bell size={16} className="text-red-400" />
                            <span className="text-sm font-bold text-red-400">{pendingLeavesCount} New</span>
                        </div>
                    )}
                </div>

                {/* Sleek Invite Code Widget */}
                {authToken && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-gray-600 transition-all shadow-sm group">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Invite Code</span>

                        <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>

                        <div className="font-mono text-sm text-blue-400 max-w-[200px] overflow-x-auto whitespace-nowrap scrollbar-hide text-center px-1">
                            {showCode ? authToken : '••••••••••••••••••••'}
                        </div>

                        <button onClick={() => setShowCode(!showCode)} className="text-gray-500 hover:text-white transition-colors p-1">
                            {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors ml-1 border border-blue-500/20"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copied ? 'Copied' : 'Copy Key'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-navigation */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('labs')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'labs'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 transform -translate-y-1'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    Manage Labs
                </button>
                <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'modules'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 transform -translate-y-1'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    Manage Modules
                </button>
                <button
                    onClick={() => setActiveTab('instructors')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'instructors'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 transform -translate-y-1'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    Manage Instructors
                </button>
                <button
                    onClick={() => setActiveTab('leaves')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all relative ${activeTab === 'leaves'
                        ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/50 transform -translate-y-1'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    Review Leaves
                    {pendingLeavesCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#1a1a1a] shadow-md animate-bounce">
                            {pendingLeavesCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-[#222] rounded-xl border border-gray-800 shadow-2xl overflow-hidden min-h-[600px]">
                {activeTab === 'labs' && <LabsManager />}
                {activeTab === 'modules' && <ModulesManager />}
                {activeTab === 'instructors' && <InstructorsManager />}
                {activeTab === 'leaves' && <LeaveRequestsManager />}
            </div>
        </div >
    );
};

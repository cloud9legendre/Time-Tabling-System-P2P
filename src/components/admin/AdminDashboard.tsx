import React, { useState } from 'react';
import { LabsManager } from './LabsManager';
import { ModulesManager } from './ModulesManager';
import { InstructorsManager } from './InstructorsManager';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'labs' | 'modules' | 'instructors'>('labs');

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
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
                Admin Management Dashboard
            </h1>

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
            </div>

            {/* Content Area */}
            <div className="bg-[#222] rounded-xl border border-gray-800 shadow-2xl overflow-hidden min-h-[600px]">
                {activeTab === 'labs' && <LabsManager />}
                {activeTab === 'modules' && <ModulesManager />}
                {activeTab === 'instructors' && <InstructorsManager />}
            </div>
        </div>
    );
};

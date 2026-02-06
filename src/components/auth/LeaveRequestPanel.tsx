import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLeaves } from '../../hooks/useSharedState';
import { useLeaveActions } from '../../hooks/useLeaveActions';
import { CalendarDays, Plus, X } from 'lucide-react';

interface LeaveRequestPanelProps {
    onClose?: () => void;
}

export const LeaveRequestPanel: React.FC<LeaveRequestPanelProps> = ({ onClose }) => {
    const { user } = useAuth();
    const leaves = useLeaves();
    const { requestLeave } = useLeaveActions();

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    // Filter my leaves
    const myLeaves = leaves.filter(l => l.instructorId === user?.publicKey).sort((a, b) => b.timestamp - a.timestamp);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate || !reason) {
            setError('All fields are required');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('End date cannot be before start date');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (startDate < today) {
            setError('Cannot request leave for past dates');
            return;
        }

        if (!user) return;

        requestLeave(user.publicKey, user.name || 'Instructor', startDate, endDate, reason);
        setIsFormOpen(false);
        setReason('');
        setStartDate('');
        setEndDate('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-400 border-green-900/50 bg-green-900/20';
            case 'REJECTED': return 'text-red-400 border-red-900/50 bg-red-900/20';
            default: return 'text-yellow-400 border-yellow-900/50 bg-yellow-900/20';
        }
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <CalendarDays className="text-blue-400" /> My Leave Requests
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                    >
                        <Plus size={16} /> New Request
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <div className="p-6 bg-[#222] border-b border-gray-800 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</div>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Reason</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white h-24"
                                placeholder="E.g. Medical leave, Conference..."
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-semibold"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="p-6">
                {myLeaves.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No leave requests found.</div>
                ) : (
                    <div className="space-y-3">
                        {myLeaves.map(leave => (
                            <div key={leave.id} className="flex items-center justify-between bg-[#222] p-4 rounded-lg border border-gray-800">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                        <span className="text-gray-300 font-medium">
                                            {leave.startDate} {leave.startDate !== leave.endDate && `→ ${leave.endDate}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{leave.reason}</p>
                                </div>
                                <div className="text-xs text-gray-600 font-mono">
                                    {new Date(leave.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

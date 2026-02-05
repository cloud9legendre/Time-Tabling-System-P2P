import React, { useMemo } from 'react';
import { useLeaves, useBookings } from '../../hooks/useSharedState';
import { useLeaveActions } from '../../hooks/useLeaveActions';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

export const LeaveRequestsManager: React.FC = () => {
    const leaves = useLeaves();
    const bookings = useBookings();
    const { updateLeaveStatus } = useLeaveActions();

    // Sort: Pending first, then by date
    const sortedLeaves = useMemo(() => {
        return [...leaves].sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return b.timestamp - a.timestamp;
        });
    }, [leaves]);

    // Check conflicts for a leave request
    const getConflicts = (leave: any) => {
        if (leave.status !== 'PENDING') return 0;

        return bookings.filter(b =>
            b.instructor === leave.instructorId &&
            b.date >= leave.startDate &&
            b.date <= leave.endDate
        ).length;
    };

    return (
        <div className="p-6 bg-[#1a1a1a] text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-yellow-500" /> Leave Requests Management
            </h2>

            <div className="grid gap-4">
                {sortedLeaves.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-[#2a2a2a] rounded-lg border border-gray-700">
                        No leave requests found.
                    </div>
                ) : (
                    sortedLeaves.map(leave => {
                        const conflictingClasses = getConflicts(leave);

                        return (
                            <div key={leave.id} className={`bg-[#2a2a2a] p-5 rounded-lg border shadow-lg transition-all ${leave.status === 'PENDING' ? 'border-yellow-900/50 hover:border-yellow-700' : 'border-gray-700 opacity-75'
                                }`}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-lg font-bold text-white">{leave.instructorName}</span>
                                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">ID: {leave.instructorId}</span>
                                            {leave.status === 'PENDING' && (
                                                <span className="bg-yellow-900/50 text-yellow-200 text-xs px-2 py-0.5 rounded border border-yellow-700 flex items-center gap-1">
                                                    <Clock size={12} /> Pending Review
                                                </span>
                                            )}
                                            {leave.status === 'APPROVED' && (
                                                <span className="bg-green-900/50 text-green-200 text-xs px-2 py-0.5 rounded border border-green-700">Approved</span>
                                            )}
                                            {leave.status === 'REJECTED' && (
                                                <span className="bg-red-900/50 text-red-200 text-xs px-2 py-0.5 rounded border border-red-700">Rejected</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase tracking-wide">Duration</span>
                                                <div className="font-mono mt-0.5 flex items-center gap-2">
                                                    {leave.startDate}
                                                    <span className="text-gray-600">to</span>
                                                    {leave.endDate}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase tracking-wide">Reason</span>
                                                <div className="italic mt-0.5">"{leave.reason}"</div>
                                            </div>
                                        </div>

                                        {conflictingClasses > 0 && leave.status === 'PENDING' && (
                                            <div className="mt-3 bg-red-900/20 border border-red-900/50 p-2 rounded flex items-center gap-2 text-red-300 text-sm">
                                                <AlertTriangle size={16} />
                                                <strong>Warning:</strong> This instructor has {conflictingClasses} scheduled classes during this period.
                                            </div>
                                        )}
                                    </div>

                                    {leave.status === 'PENDING' && (
                                        <div className="flex items-start gap-2 pt-2 md:pt-0">
                                            <button
                                                onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                                                className="flex items-center gap-2 bg-green-900/40 hover:bg-green-800 border border-green-900 text-green-100 px-4 py-2 rounded transition-colors"
                                                title="Approve Leave"
                                            >
                                                <CheckCircle2 size={18} /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                                                className="flex items-center gap-2 bg-red-900/40 hover:bg-red-800 border border-red-900 text-red-100 px-4 py-2 rounded transition-colors"
                                                title="Reject Leave"
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

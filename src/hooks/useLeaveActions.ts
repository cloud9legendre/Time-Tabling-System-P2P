import { useCallback } from 'react';
import { useYjs } from './useYjs';
import type { LeaveRequest } from '../types/schema';
import { v4 as uuidv4 } from 'uuid';

export const useLeaveActions = () => {
    const { yDoc } = useYjs();

    const requestLeave = useCallback((instructorId: string, instructorName: string, startDate: string, endDate: string, reason: string) => {
        const leavesMap = yDoc.getMap<LeaveRequest>('leaves');

        const leaveId = uuidv4();
        const leaveRequest: LeaveRequest = {
            id: leaveId,
            instructorId,
            instructorName,
            startDate,
            endDate,
            reason,
            status: 'PENDING',
            timestamp: Date.now()
        };

        leavesMap.set(leaveId, leaveRequest);
    }, [yDoc]);

    const updateLeaveStatus = useCallback((leaveId: string, status: 'APPROVED' | 'REJECTED') => {
        const leavesMap = yDoc.getMap<LeaveRequest>('leaves');
        const leave = leavesMap.get(leaveId);

        if (!leave) return;

        const updatedLeave: LeaveRequest = {
            ...leave,
            status
        };

        leavesMap.set(leaveId, updatedLeave);
    }, [yDoc]);

    return {
        requestLeave,
        updateLeaveStatus
    };
};

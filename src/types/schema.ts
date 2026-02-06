export interface Lab {
    id: string;
    name: string;
    capacity: number;
    department: string;
    is_active: boolean;
}

export interface Module {
    code: string;
    title: string;
    semester: number;
}

export interface Instructor {
    id: string; // e.g. "inst-01"
    name: string;
    email: string;
    department: string;
    passwordHash: string;
    passwordResetRequested?: number; // timestamp
    color?: string; // Assigned color for timetable
}

export interface Booking {
    id: string;
    lab_id: string;
    module_code: string;
    booked_by: string; // PublicKey
    date: string; // ISO Date "YYYY-MM-DD"
    start_time: string; // "HH:mm"
    end_time: string; // "HH:mm"
    timestamp: number;
    instructor?: string; // Name or ID of the responsible instructor
    practical_name?: string; // Optional name for the session (e.g. "Lab 1")
}

export interface UserProfile {
    publicKey: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'INSTRUCTOR';
}

export interface LeaveRequest {
    id: string;
    instructorId: string;
    instructorName: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: number;
}

// Yjs Map keys
export type SharedTypeKeys = 'labs' | 'modules' | 'bookings' | 'users' | 'instructors' | 'leaves';

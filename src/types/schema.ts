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
}

export interface UserProfile {
    publicKey: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'INSTRUCTOR';
}

// Yjs Map keys
export type SharedTypeKeys = 'labs' | 'modules' | 'bookings' | 'users';

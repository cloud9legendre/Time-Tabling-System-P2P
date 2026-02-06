import { createContext } from 'react';
import type { UserProfile } from '../types/schema';

export interface AuthContextType {
    user: UserProfile | null;
    register: (name: string) => void; // Deprecated, but keeping for compatibility if needed
    login: (id: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    requestPasswordReset: () => Promise<void>;
    createFirstAdmin: (password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

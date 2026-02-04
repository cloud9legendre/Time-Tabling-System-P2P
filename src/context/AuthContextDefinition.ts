import { createContext } from 'react';
import type { UserProfile } from '../types/schema';

export interface AuthContextType {
    user: UserProfile | null;
    register: (name: string) => void;
    loginAsAdmin: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { useYjs } from './YjsProvider';
import type { UserProfile } from '../types/schema';

interface AuthContextType {
    user: UserProfile | null;
    register: (name: string) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'lab_p2p_identity';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { yDoc } = useYjs();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        // 1. Check local storage for identity
        const storedIdentity = localStorage.getItem(STORAGE_KEY);
        if (storedIdentity) {
            const parsed = JSON.parse(storedIdentity);
            setUser(parsed);
            publishUserToYjs(parsed);
        }
    }, []);

    const publishUserToYjs = (profile: UserProfile) => {
        // Ensure this user exists in the shared map
        yDoc.transact(() => {
            const usersMap = yDoc.getMap<UserProfile>('users');
            usersMap.set(profile.publicKey, profile);
        });
    };

    const register = (name: string) => {
        // 1. Generate KeyPair
        const keyPair = nacl.sign.keyPair();
        const publicKeyProp = naclUtil.encodeBase64(keyPair.publicKey);
        // Note: In a real app, we'd store the secret key securely to sign messages. 
        // For this prototype, we're just establishing identity via Public Key.
        // Storing secret key in localStorage for potential future signing
        const secretKeyProp = naclUtil.encodeBase64(keyPair.secretKey);

        // 2. Create Profile
        const newUser: UserProfile = {
            publicKey: publicKeyProp,
            name: name,
            email: '', // Optional for now
            role: 'INSTRUCTOR', // Default role
        };

        // 3. Save to Local Storage (including secret for "session")
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newUser, _secret: secretKeyProp }));

        // 4. Update State & Yjs
        setUser(newUser);
        publishUserToYjs(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, register, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

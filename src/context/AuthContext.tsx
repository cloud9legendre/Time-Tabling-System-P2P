import React, { useEffect, useState, useCallback } from 'react';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { useYjs } from '../hooks/useYjs';
import type { UserProfile } from '../types/schema';
import { AuthContext } from './AuthContextDefinition';
import { ADMIN_KEYS } from '../utils/constants';

const STORAGE_KEY = 'lab_p2p_identity';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { yDoc, awareness } = useYjs();

    // Lazy initialization from localStorage
    const [user, setUser] = useState<UserProfile | null>(() => {
        try {
            const storedIdentity = localStorage.getItem(STORAGE_KEY);
            return storedIdentity ? JSON.parse(storedIdentity) : null;
        } catch (e) {
            console.error('Failed to parse identity:', e);
            return null;
        }
    });

    const publishUserToYjs = useCallback((profile: UserProfile) => {
        // Ensure this user exists in the shared map
        yDoc.transact(() => {
            const usersMap = yDoc.getMap<UserProfile>('users');
            usersMap.set(profile.publicKey, profile);
        });
    }, [yDoc]);

    useEffect(() => {
        // Side effects for existing user (Broadcast/Publish)
        if (user) {
            publishUserToYjs(user);

            // Broadcast presence to peers
            if (awareness) {
                awareness.setLocalStateField('user', { name: user.name, publicKey: user.publicKey });
            }
        }
    }, [awareness, publishUserToYjs, user]);

    const loginAsAdmin = () => {
        const secretKeyProp = ADMIN_KEYS.SECRET;
        const publicKeyProp = ADMIN_KEYS.PUBLIC;

        const adminUser: UserProfile = {
            publicKey: publicKeyProp,
            name: 'System Admin',
            email: 'admin@p2p.lab',
            role: 'ADMIN',
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...adminUser, _secret: secretKeyProp }));
        setUser(adminUser);

        // Changing user triggers the useEffect above, so direct publish call here might be redundant 
        // but safe to keep or rely on effect. 
        // Actually, let's let the effect do it to be consistent.
    };

    const register = (name: string) => {
        // 1. Generate KeyPair
        const keyPair = nacl.sign.keyPair();
        const publicKeyProp = naclUtil.encodeBase64(keyPair.publicKey);
        const secretKeyProp = naclUtil.encodeBase64(keyPair.secretKey);

        // 2. Create Profile
        const newUser: UserProfile = {
            publicKey: publicKeyProp,
            name: name,
            email: '', // Optional for now
            role: 'INSTRUCTOR', // Default role
        };

        // 3. Save to Local Storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newUser, _secret: secretKeyProp }));

        // 4. Update State
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            register,
            loginAsAdmin,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

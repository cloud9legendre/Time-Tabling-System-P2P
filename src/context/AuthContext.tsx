import React, { useEffect, useState, useCallback } from 'react';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { useYjs } from '../hooks/useYjs';
import type { UserProfile, Instructor } from '../types/schema';
import { AuthContext } from './AuthContextDefinition';
import { ADMIN_KEYS } from '../utils/constants';
import { hashPassword, verifyPassword } from '../utils/crypto';

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

    // Private helper for internal use if needed, but logic moved to login
    const _loginAsAdmin = (password: string) => {
        if (password !== 'admin123') return false;

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
        return true;
    };

    const login = async (id: string, password: string): Promise<boolean> => {
        // 1. Check for Admin
        if (id === 'admin') {
            return _loginAsAdmin(password);
        }

        // 2. Check Instructors
        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        const instructor = instructorsMap.get(id);

        if (!instructor) {
            console.warn('Instructor not found');
            return false;
        }

        if (instructor.passwordHash) {
            const isValid = await verifyPassword(password, instructor.passwordHash);
            if (!isValid) return false;
        } else {
            return false;
        }

        // Login successful
        const userProfile: UserProfile = {
            publicKey: instructor.id, // Using ID as public key identifier
            name: instructor.name,
            email: instructor.email,
            role: 'INSTRUCTOR',
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
        setUser(userProfile);
        return true;
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!user || user.role !== 'INSTRUCTOR') {
            throw new Error('Only instructors can change password');
        }

        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        const instructor = instructorsMap.get(user.publicKey);

        if (!instructor) {
            throw new Error('Instructor record not found');
        }

        // Verify current
        const isValid = await verifyPassword(currentPassword, instructor.passwordHash);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        const newHash = await hashPassword(newPassword);
        const updatedInstructor: Instructor = {
            ...instructor,
            passwordHash: newHash,
            passwordResetRequested: undefined // Clear any reset flag
        };

        yDoc.transact(() => {
            instructorsMap.set(instructor.id, updatedInstructor);
        });
    };

    const requestPasswordReset = async () => {
        if (!user || user.role !== 'INSTRUCTOR') return;

        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        const instructor = instructorsMap.get(user.publicKey);

        if (!instructor) return;

        const updatedInstructor: Instructor = {
            ...instructor,
            passwordResetRequested: Date.now()
        };

        yDoc.transact(() => {
            instructorsMap.set(instructor.id, updatedInstructor);
        });
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
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
            login,
            logout,
            changePassword,
            requestPasswordReset,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

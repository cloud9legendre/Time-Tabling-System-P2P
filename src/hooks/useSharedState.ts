import { useState, useEffect } from 'react';
import { useYjs } from '../hooks/useYjs';
import type { Lab, Module, Booking, UserProfile, Instructor } from '../types/schema';

export const useUsers = () => {
    const { yDoc } = useYjs();
    const [users, setUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        const usersMap = yDoc.getMap<UserProfile>('users');
        const updateState = () => {
            setUsers(Array.from(usersMap.values()));
        };
        updateState();
        usersMap.observe(() => {
            updateState();
        });
    }, [yDoc]);

    return users;
};

export const useLabs = () => {
    const { yDoc } = useYjs();
    const [labs, setLabs] = useState<Lab[]>([]);

    useEffect(() => {
        const labsMap = yDoc.getMap<Lab>('labs');

        const updateState = () => {
            setLabs(Array.from(labsMap.values()));
        };

        // Initial state
        updateState();

        // Listen for changes
        labsMap.observe(() => {
            updateState();
        });

        return () => {
            // Cleanup if necessary (Yjs observers allow multiple functions, but good practice to consider lifecycle)
            // labsMap.unobserve(updateState); // Yjs types can be tricky with unobserve references, often unnecessary for top-level component hooks if consistent
        };
    }, [yDoc]);

    return labs;
};

export const useModules = () => {
    const { yDoc } = useYjs();
    const [modules, setModules] = useState<Module[]>([]);

    useEffect(() => {
        const modulesMap = yDoc.getMap<Module>('modules');

        const updateState = () => {
            setModules(Array.from(modulesMap.values()));
        };

        updateState();
        modulesMap.observe(() => {
            updateState();
        });
    }, [yDoc]);

    return modules;
};

export const useBookings = () => {
    const { yDoc } = useYjs();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const bookingsMap = yDoc.getMap<Booking>('bookings');

        const updateState = () => {
            setBookings(Array.from(bookingsMap.values()));
        };

        updateState();
        bookingsMap.observe(() => {
            updateState();
        });
    }, [yDoc]);

    return bookings;
};

export const useInstructors = () => {
    const { yDoc } = useYjs();
    const [instructors, setInstructors] = useState<Instructor[]>([]);

    useEffect(() => {
        const instructorsMap = yDoc.getMap<Instructor>('instructors');

        const updateState = () => {
            setInstructors(Array.from(instructorsMap.values()));
        };

        updateState();
        instructorsMap.observe(() => {
            updateState();
        });
    }, [yDoc]);

    return instructors;
};

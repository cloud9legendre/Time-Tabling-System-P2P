import { useCallback } from 'react';
import { useYjs } from './useYjs';
import { hashPassword } from '../utils/crypto';
import type { Lab, Module, Booking, Instructor } from '../types/schema';

export const useAdminActions = () => {
    const { yDoc } = useYjs();

    // Labs Actions
    const addLab = useCallback((lab: Lab) => {
        const labsMap = yDoc.getMap<Lab>('labs');
        if (labsMap.has(lab.id)) {
            throw new Error(`Lab with ID ${lab.id} already exists`);
        }
        labsMap.set(lab.id, lab);
    }, [yDoc]);

    const updateLab = useCallback((lab: Lab) => {
        const labsMap = yDoc.getMap<Lab>('labs');
        if (!labsMap.has(lab.id)) {
            throw new Error(`Lab with ID ${lab.id} not found`);
        }
        labsMap.set(lab.id, lab);
    }, [yDoc]);

    const deleteLab = useCallback((labId: string) => {
        const labsMap = yDoc.getMap<Lab>('labs');
        const bookingsMap = yDoc.getMap<Booking>('bookings');

        // Referential Integrity Check
        const isUsed = Array.from(bookingsMap.values()).some(b => b.lab_id === labId);
        if (isUsed) {
            throw new Error(`Cannot delete Lab "${labId}" because it is currently used in the timetable.`);
        }

        labsMap.delete(labId);
    }, [yDoc]);

    // Modules Actions
    const addModule = useCallback((module: Module) => {
        const modulesMap = yDoc.getMap<Module>('modules');
        if (modulesMap.has(module.code)) {
            throw new Error(`Module with Code ${module.code} already exists`);
        }
        modulesMap.set(module.code, module);
    }, [yDoc]);

    const updateModule = useCallback((module: Module) => {
        const modulesMap = yDoc.getMap<Module>('modules');
        if (!modulesMap.has(module.code)) {
            throw new Error(`Module with Code ${module.code} not found`);
        }
        modulesMap.set(module.code, module);
    }, [yDoc]);

    const deleteModule = useCallback((moduleCode: string) => {
        const modulesMap = yDoc.getMap<Module>('modules');
        const bookingsMap = yDoc.getMap<Booking>('bookings');

        // Referential Integrity Check
        const isUsed = Array.from(bookingsMap.values()).some(b => b.module_code === moduleCode);
        if (isUsed) {
            throw new Error(`Cannot delete Module "${moduleCode}" because it is currently used in the timetable.`);
        }

        modulesMap.delete(moduleCode);
    }, [yDoc]);

    // Instructor Actions
    const addInstructor = useCallback(async (instructor: Omit<Instructor, 'passwordHash'>, password: string) => {
        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        if (instructorsMap.has(instructor.id)) {
            throw new Error(`Instructor with ID ${instructor.id} already exists`);
        }

        const passwordHash = await hashPassword(password);
        const newInstructor: Instructor = {
            ...instructor,
            passwordHash
        };

        instructorsMap.set(instructor.id, newInstructor);
    }, [yDoc]);

    const updateInstructor = useCallback((instructor: Instructor) => {
        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        if (!instructorsMap.has(instructor.id)) {
            throw new Error(`Instructor with ID ${instructor.id} not found`);
        }
        instructorsMap.set(instructor.id, instructor);
    }, [yDoc]);

    const deleteInstructor = useCallback((instructorId: string) => {
        const instructorsMap = yDoc.getMap<Instructor>('instructors');
        const bookingsMap = yDoc.getMap<Booking>('bookings');

        // Get the instructor details to check for name usage (legacy/current behavior stores Name)
        const instructor = instructorsMap.get(instructorId);

        if (!instructor) {
            // Already deleted or doesn't exist?
            return;
        }

        const isUsed = Array.from(bookingsMap.values()).some(b => {
            // Check if booking uses the ID (future proof) or Name (current behavior)
            return b.instructor === instructorId || (b.instructor && b.instructor === instructor.name);
        });

        if (isUsed) {
            throw new Error(`Cannot delete Instructor "${instructor.name}" because they are currently assigned to a class.`);
        }

        instructorsMap.delete(instructorId);
    }, [yDoc]);

    return {
        addLab,
        updateLab,
        deleteLab,
        addModule,
        updateModule,
        deleteModule,
        addInstructor,
        updateInstructor,
        deleteInstructor
    };
};

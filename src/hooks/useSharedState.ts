import { useState, useEffect } from 'react';
import { useYjs } from '../context/YjsProvider';
import type { Lab, Module } from '../types/schema';

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

import * as Y from 'yjs';
import { DEFAULT_LABS, DEFAULT_MODULES } from './constants';
import type { Lab, Module } from '../types/schema';

export const seedData = (doc: Y.Doc) => {
    const labsMap = doc.getMap<Lab>('labs');
    const modulesMap = doc.getMap<Module>('modules');

    doc.transact(() => {
        // Seed Labs if empty
        if (labsMap.size === 0) {
            console.log('Seeding default labs...');
            DEFAULT_LABS.forEach((lab) => {
                labsMap.set(lab.id, lab);
            });
        }

        // Seed Modules if empty
        if (modulesMap.size === 0) {
            console.log('Seeding default modules...');
            DEFAULT_MODULES.forEach((mod) => {
                modulesMap.set(mod.code, mod);
            });
        }
    });
};

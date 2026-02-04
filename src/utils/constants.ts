import type { Lab, Module } from '../types/schema';

export const DEFAULT_LABS: Lab[] = [
    { id: 'lab_1', name: 'Computer Lab 1', capacity: 40, department: 'CS', is_active: true },
    { id: 'lab_2', name: 'Computer Lab 2', capacity: 30, department: 'CS', is_active: true },
    { id: 'lab_3', name: 'Network Lab', capacity: 25, department: 'Networking', is_active: true },
    { id: 'lab_4', name: 'Multimedia Lab', capacity: 20, department: 'Multimedia', is_active: true },
];

export const DEFAULT_MODULES: Module[] = [
    { code: 'CS101', title: 'Introduction to Programming', semester: 1 },
    { code: 'CS102', title: 'Web Development Basics', semester: 1 },
    { code: 'CS201', title: 'Data Structures', semester: 2 },
    { code: 'CS202', title: 'Database Management', semester: 2 },
    { code: 'NET101', title: 'Networking Fundamentals', semester: 1 },
];

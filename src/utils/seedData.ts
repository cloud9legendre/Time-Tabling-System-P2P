import * as Y from 'yjs';
import { DEFAULT_LABS, DEFAULT_MODULES } from './constants';
import type { Lab, Module, Instructor, Booking, LeaveRequest } from '../types/schema';

// Helper for hashes
// "password" -> SHA256
const MOCK_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';

const INSTRUCTOR_COLORS = [
    '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#06b6d4', '#eab308', '#f43f5e'
];

const DEFAULT_INSTRUCTORS: Instructor[] = [
    {
        id: 'inst-01',
        name: 'Dr. Alan Grant',
        email: 'alan@jurassic.edu',
        department: 'Paleontology',
        passwordHash: MOCK_HASH,
        color: INSTRUCTOR_COLORS[0]
    },
    {
        id: 'inst-02',
        name: 'Dr. Ellie Sattler',
        email: 'ellie@jurassic.edu',
        department: 'Paleobotany',
        passwordHash: MOCK_HASH,
        color: INSTRUCTOR_COLORS[4] // Pink
    },
    {
        id: 'inst-03',
        name: 'Dr. Ian Malcolm',
        email: 'ian@jurassic.edu',
        department: 'Chaos Theory',
        passwordHash: MOCK_HASH,
        color: INSTRUCTOR_COLORS[1] // Green
    }
];

// Feb 2026 Starts on Sunday.
// Week 1: 2nd (Mon) - 6th (Fri)
// Week 2: 9th (Mon) - 13th (Fri)
// Week 3: 16th (Mon) - 20th (Fri)
const DEFAULT_BOOKINGS: Booking[] = [
    // Mon Feb 02 2026
    { id: 'book-01', module_code: 'CS101', lab_id: 'lab_1', start_time: '09:00', end_time: '11:00', date: '2026-02-02', instructor: 'inst-01', practical_name: 'Intro 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-02', module_code: 'CS201', lab_id: 'lab_2', start_time: '11:00', end_time: '13:00', date: '2026-02-02', instructor: 'inst-02', practical_name: 'Trees 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-03', module_code: 'NET101', lab_id: 'lab_3', start_time: '14:00', end_time: '16:00', date: '2026-02-02', instructor: 'inst-03', practical_name: 'Packets 26', booked_by: 'system', timestamp: Date.now() },

    // Tue Feb 03 2026
    { id: 'book-04', module_code: 'CS102', lab_id: 'lab_1', start_time: '09:00', end_time: '11:00', date: '2026-02-03', instructor: 'inst-01', practical_name: 'HTML 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-05', module_code: 'CS202', lab_id: 'lab_2', start_time: '13:00', end_time: '15:00', date: '2026-02-03', instructor: 'inst-02', practical_name: 'SQL 26', booked_by: 'system', timestamp: Date.now() },

    // Wed Feb 04 2026 (Heavy Day)
    { id: 'book-06', module_code: 'CS201', lab_id: 'lab_1', start_time: '09:00', end_time: '11:00', date: '2026-02-04', instructor: 'inst-03', practical_name: 'Graph 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-07', module_code: 'CS101', lab_id: 'lab_1', start_time: '11:00', end_time: '13:00', date: '2026-02-04', instructor: 'inst-01', practical_name: 'CSS 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-08', module_code: 'NET101', lab_id: 'lab_3', start_time: '14:00', end_time: '16:00', date: '2026-02-04', instructor: 'inst-03', practical_name: 'Subnet 26', booked_by: 'system', timestamp: Date.now() },

    // Thu Feb 05 2026
    { id: 'book-09', module_code: 'CS202', lab_id: 'lab_2', start_time: '09:00', end_time: '12:00', date: '2026-02-05', instructor: 'inst-02', practical_name: 'Norm 26', booked_by: 'system', timestamp: Date.now() },

    // Fri Feb 06 2026
    { id: 'book-10', module_code: 'CS102', lab_id: 'lab_4', start_time: '10:00', end_time: '12:00', date: '2026-02-06', instructor: 'inst-01', practical_name: 'Media 26', booked_by: 'system', timestamp: Date.now() },

    // Week 2
    // Mon Feb 09 2026
    { id: 'book-11', module_code: 'CS101', lab_id: 'lab_1', start_time: '09:00', end_time: '11:00', date: '2026-02-09', instructor: 'inst-01', practical_name: 'React 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-12', module_code: 'CS201', lab_id: 'lab_2', start_time: '12:00', end_time: '14:00', date: '2026-02-09', instructor: 'inst-02', practical_name: 'BST 26', booked_by: 'system', timestamp: Date.now() },

    // Tue Feb 10 2026
    { id: 'book-13', module_code: 'NET101', lab_id: 'lab_3', start_time: '14:00', end_time: '16:00', date: '2026-02-10', instructor: 'inst-03', practical_name: 'VLAN 26', booked_by: 'system', timestamp: Date.now() },

    // Wed Feb 11 2026
    { id: 'book-14', module_code: 'CS202', lab_id: 'lab_2', start_time: '09:00', end_time: '11:00', date: '2026-02-11', instructor: 'inst-02', practical_name: 'NoSQL 26', booked_by: 'system', timestamp: Date.now() },

    // Thu Feb 12 2026
    { id: 'book-15', module_code: 'CS101', lab_id: 'lab_1', start_time: '13:00', end_time: '15:00', date: '2026-02-12', instructor: 'inst-01', practical_name: 'Tailwind 26', booked_by: 'system', timestamp: Date.now() },

    // Fri Feb 13 2026 (Leave Day for Ian)
    { id: 'book-16', module_code: 'CS102', lab_id: 'lab_4', start_time: '09:00', end_time: '11:00', date: '2026-02-13', instructor: 'inst-01', practical_name: 'Canvas 26', booked_by: 'system', timestamp: Date.now() },

    // Week 3
    // Mon Feb 16 2026
    { id: 'book-17', module_code: 'CS201', lab_id: 'lab_2', start_time: '10:00', end_time: '12:00', date: '2026-02-16', instructor: 'inst-02', practical_name: 'HashMaps 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-18', module_code: 'NET101', lab_id: 'lab_3', start_time: '14:00', end_time: '16:00', date: '2026-02-16', instructor: 'inst-03', practical_name: 'Routing 26', booked_by: 'system', timestamp: Date.now() },

    // Tue Feb 17 2026
    { id: 'book-19', module_code: 'CS202', lab_id: 'lab_2', start_time: '09:00', end_time: '12:00', date: '2026-02-17', instructor: 'inst-02', practical_name: 'Indexing 26', booked_by: 'system', timestamp: Date.now() },
    { id: 'book-20', module_code: 'CS101', lab_id: 'lab_1', start_time: '13:00', end_time: '15:00', date: '2026-02-17', instructor: 'inst-01', practical_name: 'Redux 26', booked_by: 'system', timestamp: Date.now() },
];

const DEFAULT_LEAVES: LeaveRequest[] = [
    { id: 'leave-01', instructorId: 'inst-01', instructorName: 'Dr. Alan Grant', startDate: '2026-02-23', endDate: '2026-02-28', reason: 'Digging for 2026 bones', status: 'APPROVED', timestamp: Date.now() },
    { id: 'leave-02', instructorId: 'inst-03', instructorName: 'Dr. Ian Malcolm', startDate: '2026-02-13', endDate: '2026-02-13', reason: 'Chaos Conf 2026', status: 'PENDING', timestamp: Date.now() }
];

export const seedData = (doc: Y.Doc) => {
    const labsMap = doc.getMap<Lab>('labs');
    const modulesMap = doc.getMap<Module>('modules');
    const instructorsMap = doc.getMap<Instructor>('instructors');
    const bookingsMap = doc.getMap<Booking>('bookings');
    const leavesMap = doc.getMap<LeaveRequest>('leave-requests');

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

        // Seed Instructors if empty
        // Also ensure default instructors exist even if map is not empty (careful not to overwrite if modified?)
        // The original logic was "if empty". I'll stick to that to be safe, but the user might need to clear DB.
        // However, I will check if specific IDs exist.
        DEFAULT_INSTRUCTORS.forEach((inst) => {
            if (!instructorsMap.has(inst.id)) {
                instructorsMap.set(inst.id, inst);
            }
        });

        // Seed Bookings if empty
        // To force update for this request, I will check if these specific IDs exist.
        // But since the IDs are generic (book-01), checking if they exist is good.
        // If they exist (from Feb 2025), I should overwrite them?
        // Yes, the user wants "instead of 2025 feb".
        // So I will overwrite these specific IDs.
        DEFAULT_BOOKINGS.forEach((booking) => {
            bookingsMap.set(booking.id, booking);
        });

        // Seed Leaves
        DEFAULT_LEAVES.forEach((leave) => {
            leavesMap.set(leave.id, leave);
        });
    });
};

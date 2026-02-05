import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import { useModules, useBookings, useLabs, useInstructors } from '../hooks/useSharedState';
import type { Booking } from '../types/schema';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string; // "YYYY-MM-DD"
    bookingToEdit?: Booking | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    initialDate,
    bookingToEdit,
}) => {
    const { user } = useAuth();
    const { yDoc } = useYjs();
    const modules = useModules();
    const labs = useLabs();
    const instructors = useInstructors();
    const allBookings = useBookings();

    const [selectedLab, setSelectedLab] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [isWeekly, setIsWeekly] = useState(false);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (bookingToEdit) {
                // Populate fields for editing
                setSelectedLab(bookingToEdit.lab_id);
                setSelectedModule(bookingToEdit.module_code);
                setSelectedInstructor(bookingToEdit.instructor || '');
                setStartTime(bookingToEdit.start_time);
                setEndTime(bookingToEdit.end_time);
                setIsWeekly(false); // Default to false for editing single instance
                setRecurrenceEndDate('');
            } else {
                // Reset for new booking
                setSelectedLab('');
                setSelectedModule('');
                setSelectedInstructor('');
                setStartTime('09:00');
                setEndTime('10:00');
                setIsWeekly(false);
                setRecurrenceEndDate('');
            }
            setError('');
        }
    }, [isOpen, bookingToEdit, initialDate]);

    if (!isOpen) return null;

    const createBookingObject = (date: string, id?: string): Booking => ({
        id: id || uuidv4(),
        lab_id: selectedLab,
        module_code: selectedModule,
        booked_by: user?.publicKey || '',
        date: date,
        start_time: startTime,
        end_time: endTime,
        timestamp: Date.now(),
        instructor: selectedInstructor || undefined,
    });

    const validateBooking = (labId: string, instructor: string, date: string, start: string, end: string, excludeBookingId?: string): string | null => {
        for (const b of allBookings) {
            if (b.date !== date) continue;
            // Exclude current booking if we are editing it
            if (excludeBookingId && b.id === excludeBookingId) continue;

            // Check overlap
            const isOverlap = b.start_time < end && b.end_time > start;
            if (!isOverlap) continue;

            // 1. Lab Conflict
            if (b.lab_id === labId) {
                return `Lab conflict: Lab is already booked on ${date} (${b.start_time} - ${b.end_time})`;
            }

            // 2. Instructor Conflict
            // Note: We check if both bookings have an instructor and if they match.
            // Current system stores Instructor Name.
            if (instructor && b.instructor && b.instructor === instructor) {
                return `Instructor conflict: ${instructor} is already teaching on ${date} (${b.start_time} - ${b.end_time})`;
            }
        }
        return null;
    };

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('You must be identified to book.');
            return;
        }

        if (startTime >= endTime) {
            setError('End time must be after start time.');
            return;
        }

        // Use initialDate as the target date 
        // (note: for new bookings, logic below handles recurring. 
        // for edit, we stick to the specific date unless we want to move it, which this modal supports via existing date logic passing)

        // For Editing: We currently only support editing the single instance clicked
        if (bookingToEdit) {
            // Check conflict for the single edit
            const conflictError = validateBooking(selectedLab, selectedInstructor, bookingToEdit.date, startTime, endTime, bookingToEdit.id);
            if (conflictError) {
                setError(conflictError);
                return;
            }

            const updatedBooking = createBookingObject(bookingToEdit.date, bookingToEdit.id);

            yDoc.transact(() => {
                const bookingsMap = yDoc.getMap<Booking>('bookings');
                bookingsMap.set(updatedBooking.id, updatedBooking);
            });
        } else {
            // For New Booking (supports recurrence)
            const bookingsToCreate: Booking[] = [];
            const currentDate = new Date(initialDate);
            const endDateObj = isWeekly && recurrenceEndDate ? new Date(recurrenceEndDate) : new Date(initialDate);

            // Loop for recurrence
            while (currentDate <= endDateObj) {
                const currentStr = currentDate.toISOString().split('T')[0];

                const conflictError = validateBooking(selectedLab, selectedInstructor, currentStr, startTime, endTime);
                if (conflictError) {
                    setError(conflictError);
                    return;
                }

                bookingsToCreate.push(createBookingObject(currentStr));

                if (!isWeekly) break;
                currentDate.setDate(currentDate.getDate() + 7); // Add 7 days
            }

            // Save to Yjs
            yDoc.transact(() => {
                const bookingsMap = yDoc.getMap<Booking>('bookings');
                bookingsToCreate.forEach(b => {
                    bookingsMap.set(b.id, b);
                });
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">
                    {bookingToEdit ? `Edit Booking on ${bookingToEdit.date}` : `Book Slot for ${initialDate}`}
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleBook} className="space-y-4">
                    {/* Lab Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Lab</label>
                        <select
                            value={selectedLab}
                            onChange={(e) => setSelectedLab(e.target.value)}
                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select a Lab...</option>
                            {labs.map((l) => (
                                <option key={l.id} value={l.id}>{l.name} ({l.capacity} seats)</option>
                            ))}
                        </select>
                    </div>

                    {/* Module Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Module</label>
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select a module...</option>
                            {modules.map((m) => (
                                <option key={m.code} value={m.code}>
                                    {m.code} - {m.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Instructor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Instructor</label>
                        <select
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select an Instructor...</option>
                            {instructors.map((inst) => (
                                <option key={inst.id} value={inst.name}>
                                    {inst.name} ({inst.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Recurrence - Only show for NEW bookings */}
                    {!bookingToEdit && (
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <label className="flex items-center space-x-2 text-white mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isWeekly}
                                    onChange={(e) => setIsWeekly(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                                />
                                <span className="font-medium">Repeat Weekly</span>
                            </label>

                            {isWeekly && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Until Date</label>
                                    <input
                                        type="date"
                                        value={recurrenceEndDate}
                                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                        min={initialDate}
                                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                        required={isWeekly}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                        >
                            {bookingToEdit ? 'Update Booking' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

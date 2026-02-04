import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import { useModules, useBookings, useLabs, useUsers } from '../hooks/useSharedState';
import type { Booking } from '../types/schema';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string; // "YYYY-MM-DD"
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    initialDate,
}) => {
    const { user } = useAuth();
    const { yDoc } = useYjs();
    const modules = useModules();
    const labs = useLabs();
    const users = useUsers();
    const allBookings = useBookings();

    const [selectedLab, setSelectedLab] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [isWeekly, setIsWeekly] = useState(false);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const createBookingObject = (date: string): Booking => ({
        id: uuidv4(),
        lab_id: selectedLab,
        module_code: selectedModule,
        booked_by: user?.publicKey || '',
        date: date,
        start_time: startTime,
        end_time: endTime,
        timestamp: Date.now(),
        instructor: selectedInstructor || undefined,
    });

    const checkConflict = (labId: string, date: string, start: string, end: string) => {
        return allBookings.some((b) => {
            if (b.lab_id !== labId || b.date !== date) return false;
            return b.start_time < end && b.end_time > start;
        });
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

        const bookingsToCreate: Booking[] = [];
        const currentDate = new Date(initialDate);
        const endDateObj = isWeekly && recurrenceEndDate ? new Date(recurrenceEndDate) : new Date(initialDate);

        // Loop for recurrence
        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];

            if (checkConflict(selectedLab, dateStr, startTime, endTime)) {
                setError(`Conflict detected on ${dateStr}. Booking failed.`);
                return;
            }

            bookingsToCreate.push(createBookingObject(dateStr));

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

        onClose();
        // Reset fields
        setSelectedModule('');
        setSelectedInstructor('');
        setIsWeekly(false);
        setRecurrenceEndDate('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Book Slot for {initialDate}</h3>

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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Instructor (Optional)</label>
                        <select
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Assign to self ({user?.name})</option>
                            {users.map((u) => (
                                <option key={u.publicKey} value={u.name}>
                                    {u.name} ({u.role})
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

                    {/* Recurrence */}
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
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

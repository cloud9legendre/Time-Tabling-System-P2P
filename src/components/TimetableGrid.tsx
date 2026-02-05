import React, { useMemo, useState } from 'react';
import { useBookings } from '../hooks/useSharedState';
import { BookingModal } from './BookingModal';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import type { Booking } from '../types/schema';

export const TimetableGrid: React.FC = () => {
    const bookings = useBookings();
    const { isAdmin, user } = useAuth();
    const { yDoc } = useYjs();

    // State for toggling month
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // --- Helpers for Calendar Generation ---
    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        // Actual days
        for (let i = 1; i <= daysCount; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }
        return days;
    }, [currentDate]);

    // Sorting bookings for a specific date
    const getBookingsForDate = (dateStr: string) => {
        return bookings.filter(b => b.date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    const handleDayClick = (dateStr: string) => {
        setEditingBooking(null);
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    const handleEdit = (booking: Booking) => {
        setEditingBooking(booking);
        setSelectedDate(booking.date);
        setIsModalOpen(true);
    };

    const handleDelete = (bookingId: string) => {
        if (!isAdmin) return;
        if (confirm('Are you sure you want to delete this booking?')) {
            yDoc.transact(() => {
                const bookingsMap = yDoc.getMap<Booking>('bookings');
                bookingsMap.delete(bookingId);
            });
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 flex justify-between items-center border-b border-gray-800 bg-[#1a1a1a] z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold text-blue-500 w-[250px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                    >
                        →
                    </button>
                </div>

                {/* Welcome Message */}
                {user && (
                    <div className="border-l border-gray-700 pl-6">
                        <p className="text-sm text-gray-400">Welcome back,</p>
                        <p className="text-lg font-semibold text-gray-200">{user.name}</p>
                    </div>
                )}
            </div>

            {/* Calendar Container */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Days Header */}
                <div className="flex-none grid grid-cols-7 border-b border-gray-800 bg-[#222]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-500 uppercase text-xs tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid - Expands to fill remaining space */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-gray-800 gap-px border-gray-800">
                    {monthData.map((dateStr, index) => {
                        // Empty Cell
                        if (!dateStr) {
                            return <div key={`empty-${index}`} className="bg-[#181818]"></div>;
                        }

                        const dayBookings = getBookingsForDate(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const dateObj = new Date(dateStr);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDayClick(dateStr)}
                                className={`
                                    relative group p-2 transition-all duration-200
                                    flex flex-col gap-1 cursor-pointer overflow-hidden
                                    ${isToday
                                        ? 'bg-blue-900/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                                        : 'bg-[#1f1f1f] hover:bg-[#252525]'
                                    }
                                    ${!isToday && isWeekend ? 'bg-[#1a1a1a]' : ''}
                                `}
                            >
                                {/* Date Header */}
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-bold leading-none ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {parseInt(dateStr.split('-')[2])}
                                    </span>
                                    {dayBookings.length > 0 && (
                                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 rounded-full">
                                            {dayBookings.length}
                                        </span>
                                    )}
                                </div>

                                {/* Bookings List - Scrollable if too many */}
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                    {dayBookings.map(booking => (
                                        <div key={booking.id} className="flex-none text-[10px] bg-[#333] hover:bg-[#3a3a3a] px-1.5 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors group/item relative shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-blue-300 mr-1">{booking.start_time}</span>
                                                <span className="truncate font-medium text-gray-300 flex-1">{booking.module_code}</span>
                                                {isAdmin && (
                                                    <div className="flex gap-1 ml-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(booking);
                                                            }}
                                                            className="text-yellow-400 hover:text-yellow-200"
                                                            title="Edit"
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(booking.id);
                                                            }}
                                                            className="text-red-400 hover:text-red-200"
                                                            title="Delete"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hitbox filler */}
                                    <div className="flex-1 min-h-[10px]"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
                bookingToEdit={editingBooking}
            />
        </div>
    );
};

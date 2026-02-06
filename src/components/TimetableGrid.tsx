import React, { useMemo, useState, useRef } from 'react';
import { useBookings, useLeaves, useModules, useLabs, useInstructors } from '../hooks/useSharedState';
import { BookingModal } from './BookingModal';
import { useAuth } from '../hooks/useAuth';
import { useYjs } from '../hooks/useYjs';
import type { Booking } from '../types/schema';

const INSTRUCTOR_COLORS = [
    '#3b82f6', // Blue 500
    '#22c55e', // Green 500
    '#a855f7', // Purple 500
    '#f97316', // Orange 500
    '#ec4899', // Pink 500
    '#14b8a6', // Teal 500
    '#6366f1', // Indigo 500
    '#06b6d4', // Cyan 500
    '#eab308', // Yellow 500
    '#f43f5e', // Rose 500
];

export const TimetableGrid: React.FC = () => {
    const bookings = useBookings();
    const leaves = useLeaves();
    const modules = useModules();
    const labs = useLabs();
    const instructors = useInstructors();
    const { isAdmin, user } = useAuth();
    const { yDoc } = useYjs();

    // State for toggling month
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // Hover State for Tooltip
    const [hoveredData, setHoveredData] = useState<{
        booking: Booking;
        x: number;
        y: number;
        moduleTitle: string;
        labName: string;
        instructorName: string;
        isOnLeave: boolean;
    } | null>(null);

    const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getInstructorColor = (id: string | undefined): string => {
        if (!id) return '#6b7280';
        const inst = instructors.find(i => i.id === id);
        if (inst?.color) return inst.color;

        // Fallback for older data
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % INSTRUCTOR_COLORS.length;
        return INSTRUCTOR_COLORS[index];
    };

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

    const gridRows = Math.ceil(monthData.length / 7);

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
            setHoveredData(null);
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-gray-200 overflow-y-auto">
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
            <div className="flex-grow flex flex-col">
                {/* Days Header */}
                <div className="flex-none grid grid-cols-7 border-b border-gray-800 bg-[#222]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-gray-500 uppercase text-xs tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid - Expands to fill remaining space */}
                <div
                    className="flex-grow grid grid-cols-7 bg-gray-800 gap-px border-gray-800"
                    style={{
                        gridTemplateRows: `repeat(${gridRows}, minmax(180px, 1fr))`
                    }}
                >
                    {monthData.map((dateStr, index) => {
                        // Empty Cell
                        if (!dateStr) {
                            return <div key={`empty-${index}`} className="bg-[#181818]"></div>;
                        }

                        const dayBookings = getBookingsForDate(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const dateObj = new Date(dateStr);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;



                        // Check for leaves on this day
                        const activeLeaves = leaves.filter(l =>
                            l.status === 'APPROVED' &&
                            dateStr >= l.startDate &&
                            dateStr <= l.endDate
                        );

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDayClick(dateStr)}
                                className={`
                                    relative group p-2 transition-all duration-200
                                    flex flex-col gap-1 cursor-pointer overflow-hidden min-h-0
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

                                {/* Active Leaves Indicator */}
                                {activeLeaves.length > 0 && (
                                    <div className="flex flex-col gap-0.5 mb-1">
                                        {activeLeaves.map(leave => (
                                            <div key={leave.id} className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-300 px-1.5 py-0.5 rounded truncate flex items-center gap-1" title={`${leave.instructorName} is on leave`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                                {leave.instructorName}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Bookings List - Scrollable if too many */}
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                    {dayBookings.map(booking => {
                                        const isOnLeave = leaves.some(l =>
                                            l.status === 'APPROVED' &&
                                            l.instructorId === booking.instructor &&
                                            dateStr >= l.startDate &&
                                            dateStr <= l.endDate
                                        );

                                        const instructorName = instructors.find(i => i.id === booking.instructor)?.name || booking.instructor || 'Unknown';
                                        const moduleTitle = modules.find(m => m.code === booking.module_code)?.title || 'Unknown Module';
                                        const labName = labs.find(l => l.id === booking.lab_id)?.name || booking.lab_id;

                                        return (
                                            <div
                                                key={booking.id}
                                                onMouseEnter={(e) => {
                                                    if (leaveTimeoutRef.current) {
                                                        clearTimeout(leaveTimeoutRef.current);
                                                        leaveTimeoutRef.current = null;
                                                    }
                                                    setHoveredData({
                                                        booking,
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                        moduleTitle,
                                                        labName,
                                                        instructorName,
                                                        isOnLeave
                                                    });
                                                }}
                                                onMouseMove={(e) => {
                                                    setHoveredData(prev => {
                                                        // If we are transitioning, ensure we capture the new booking's context if needed, 
                                                        // but usually enter sets it. Here we just update X/Y for the *current* hover session.
                                                        // However, if we just entered B, prev might be A for a microsecond or B.
                                                        // We want to update X/Y regardless of ID if we are firmly over this element.
                                                        // But safely, only update if prev exists.
                                                        if (prev) {
                                                            return { ...prev, x: e.clientX, y: e.clientY };
                                                        }
                                                        return prev;
                                                    });
                                                }}
                                                onMouseLeave={() => {
                                                    leaveTimeoutRef.current = setTimeout(() => {
                                                        setHoveredData(null);
                                                    }, 50);
                                                }}
                                                className={`flex-none px-1.5 py-1 rounded-r border-y border-r transition-all group/booking relative shadow-sm cursor-help
                                            ${isOnLeave
                                                        ? 'bg-red-900/40 border-red-500/50 hover:bg-red-900/60'
                                                        : 'bg-[#2a2a2a] border-gray-700 text-gray-200 hover:bg-[#333] hover:border-gray-500'
                                                    }
                                        `}
                                                style={{
                                                    borderLeft: `4px solid ${getInstructorColor(booking.instructor)}`
                                                }}
                                            >
                                                {/* Compact View */}
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className="text-[10px] text-blue-400 font-mono leading-none">{booking.start_time}</span>
                                                    <span className="text-[10px] font-bold text-gray-300 leading-none truncate ml-1" title={booking.practical_name || booking.module_code}>
                                                        {booking.practical_name || booking.module_code}
                                                    </span>
                                                </div>

                                                <div className="text-[9px] text-gray-500 truncate leading-tight">{instructorName}</div>

                                                {/* Admin Controls (Overlay) */}
                                                {isAdmin && (
                                                    <div className="absolute top-0 right-0 h-full flex items-center pr-1 gap-1 opacity-0 group-hover/booking:opacity-100 transition-opacity bg-black/50 backdrop-blur-[1px] rounded-r">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(booking);
                                                            }}
                                                            className="text-yellow-400 hover:text-yellow-200 p-0.5"
                                                            title="Edit"
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(booking.id);
                                                            }}
                                                            className="text-red-400 hover:text-red-200 p-0.5"
                                                            title="Delete"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

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

            {/* Global Fixed Tooltip */}
            {hoveredData && (
                <div
                    className="fixed z-[9999] bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-600 rounded-lg shadow-2xl p-4 text-left pointer-events-none w-64 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: Math.min(hoveredData.y + 15, window.innerHeight - 250),
                        left: Math.min(hoveredData.x + 15, window.innerWidth - 270),
                    }}
                >
                    <div className="text-white font-bold text-sm mb-1 leading-snug">{hoveredData.moduleTitle}</div>

                    {hoveredData.booking.practical_name && (
                        <div className="text-xs text-emerald-400 font-medium mb-1 italic border-l-2 border-emerald-500 pl-2">
                            {hoveredData.booking.practical_name}
                        </div>
                    )}

                    <div className="text-xs text-blue-400 font-mono mb-3">{hoveredData.booking.module_code}</div>

                    <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex justify-between border-b border-gray-700/50 pb-1">
                            <span className="text-gray-500">Scheduled:</span>
                            <span className="font-mono text-white">{hoveredData.booking.start_time} - {hoveredData.booking.end_time}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700/50 pb-1">
                            <span className="text-gray-500">Laboratory:</span>
                            <span className="font-medium text-white">{hoveredData.labName}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-0.5">Instructor:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="font-medium text-gray-200">{hoveredData.instructorName}</span>
                            </div>
                        </div>

                        {hoveredData.isOnLeave && (
                            <div className="mt-3 bg-red-900/30 border border-red-500/50 rounded p-2 text-center shadow-inner">
                                <div className="text-red-400 font-bold text-[10px] uppercase tracking-wider mb-1">⚠ Instructor Unavailable</div>
                                <div className="text-red-200 text-[10px]">Marked as ON LEAVE for this date.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
};

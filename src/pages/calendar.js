import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import calendarData from './calendar.txt';
const BrandHeader = () => (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        className="h-24 w-24"
                        src='logo.png'
                        alt="GBPS Trust Logo"
                    />
                    <div>
                        <h1 className="text-4xl font-bold text-white">GBPS Trust Vrindavan</h1>
                        <p className="text-2xl text-yellow-100">गौरब्द 539</p>
                        <p className="text-2xl text-yellow-100">विक्रम संवत 2082</p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="bg-orange-600/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-white text-sm">
                            Serving the Vaishnava Community
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
const CalendarView = ({ events, selectedDate, onSelectDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));
    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();
    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };
    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };
    const getDayEvents = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return events.filter(event => {
            const eventDate = new Date(event.dateObj);
            return eventDate.toDateString() === date.toDateString();
        });
    };
    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-orange-500" />
                </button>
                <h2 className="text-lg font-semibold text-orange-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-orange-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-12 p-1" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dayEvents = getDayEvents(day);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const hasEvents = dayEvents.length > 0;
                    return (
                        <button
                            key={day}
                            onClick={() => onSelectDate(date)}
                            className={`h-12 p-1 relative rounded-lg transition-colors
                ${isSelected ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'}
                ${hasEvents ? 'font-semibold' : ''}`}
                        >
                            <span className="text-sm">{day}</span>
                            {hasEvents && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
const CalendarUI = () => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSummary, setSelectedSummary] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const handleDateSelect = (date) => {
        if (date !== selectedDate) {
            setSearchTerm('');
            setSelectedSummary('');
        }
        setSelectedDate(date === selectedDate ? null : date);
    };
    const parseEvents = (icalData) => {
        const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
        const events = [];
        let match;
        while ((match = eventRegex.exec(icalData)) !== null) {
            const eventData = match[1];
            const event = {};
            const properties = eventData.split('\n');
            properties.forEach(prop => {
                const [key, ...value] = prop.split(':');
                if (key && value.length) {
                    const cleanKey = key.split(';')[0].trim();
                    event[cleanKey] = value.join(':').trim();
                }
            });
            function formatDate(date) {
                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = days[date.getDay()];
                const dayNumber = date.getDate();
                const monthName = months[date.getMonth()];
                const year = date.getFullYear();
                return `${dayName} ${dayNumber} ${monthName} ${year}`;
            }
            if (event.DTSTART) {
                const date = event.DTSTART.replace('VALUE=DATE:', '');
                event.dateObj = new Date(
                    date.slice(0, 4),
                    parseInt(date.slice(4, 6)) - 1,
                    date.slice(6, 8)
                );
                event.formattedDate = formatDate(event.dateObj);
            }
            events.push(event);
        }
        const processedEvents = events.map(event => {
            if (event.SUMMARY?.toLowerCase().includes('एकादशी')) {
                const nextDay = new Date(event.dateObj);
                nextDay.setDate(nextDay.getDate() + 1);
                const breakFastEvent = events.find(e =>
                    e.dateObj?.getTime() === nextDay.getTime() &&
                    e.SUMMARY?.toLowerCase().includes('पारण')
                );
                if (breakFastEvent) {
                    return {
                        ...event,
                        breakFastDetails: breakFastEvent.SUMMARY
                    };
                }
            }
            return event;
        });
        return processedEvents;
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(calendarData);
                const text = await response.text();
                const parsedEvents = parseEvents(text);
                setEvents(parsedEvents);
                setError(null);
            } catch (err) {
                console.error('Error loading calendar data:', err);
                setError('Failed to load calendar data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    function getLevenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null)
        );
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }
        return matrix[str2.length][str1.length];
    }

    function containsFuzzyMatch(text, searchTerm, maxDistance = 2) {
        if (!text || !searchTerm) return false;
        text = text.toLowerCase();
        searchTerm = searchTerm.toLowerCase();
        if (text.includes(searchTerm)) return true;
        const words = text.split(/\s+/);
        for (const word of words) {
            if (Math.abs(word.length - searchTerm.length) > maxDistance) continue;
            if (getLevenshteinDistance(word, searchTerm) <= maxDistance) return true;
        }
        return false;
    }
    const filteredEvents = events.filter(event => {
        const searchTermLower = searchTerm.toLowerCase();
        const summaryMatches = searchTerm === '' || containsFuzzyMatch(event.SUMMARY, searchTermLower);
        const descriptionMatches = searchTerm === '' || containsFuzzyMatch(event.DESCRIPTION, searchTermLower);
        const matchesSearch = searchTerm === '' || summaryMatches || descriptionMatches;
        const matchesSummary = !selectedSummary || event.SUMMARY === selectedSummary;
        const matchesDate = !selectedDate || event.dateObj?.toDateString() === selectedDate.toDateString();
        return matchesSearch && matchesSummary && matchesDate;
    });
    const filteredEventsStraight = events.filter(event => {
        const searchTermLower = searchTerm.toLowerCase();
        const summaryMatches = event.SUMMARY?.toLowerCase().includes(searchTermLower);
        const descriptionMatches = event.DESCRIPTION?.toLowerCase().includes(searchTermLower);
        const matchesSearch = searchTerm === '' || summaryMatches || descriptionMatches;
        const matchesSummary = !selectedSummary || event.SUMMARY === selectedSummary;
        const matchesDate = !selectedDate || event.dateObj?.toDateString() === selectedDate.toDateString();
        return matchesSearch && matchesSummary && matchesDate;
    });
    const uniqueSummaries = [...new Set(events.map(event => event.SUMMARY))];
    if (loading) {
        return (
            <>
                <BrandHeader />
                <div className="flex justify-center items-center min-h-64">
                    <div className="text-lg text-gray-600">Loading calendar data...</div>
                </div>
            </>
        );
    }
    if (error) {
        return (
            <>
                <BrandHeader />
                <div className="flex justify-center items-center min-h-64">
                    <div className="text-lg text-red-600">{error}</div>
                </div>
            </>
        );
    }
    return (
        <div className="min-h-screen bg-orange-50">
            <BrandHeader />
            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <CalendarView
                            events={events}
                            selectedDate={selectedDate}
                            onSelectDate={handleDateSelect}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1 relative w-full md:w-1/2">
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                                </div>
                                <select
                                    value={selectedSummary}
                                    onChange={(e) => setSelectedSummary(e.target.value)}
                                    className="flex-1 w-full md:w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">All Events</option>
                                    {uniqueSummaries.map(summary => (
                                        <option key={summary} value={summary}>
                                            {summary}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-4">
                                {filteredEvents.map(event => (
                                    <div
                                        key={event.UID}
                                        className="p-4 border border-orange-100 rounded-lg hover:shadow-md transition-shadow bg-white"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-lg font-semibold text-orange-800">{event.SUMMARY}</h2>
                                                <p className="text-gray-600">{event.formattedDate}</p>
                                                {event.breakFastDetails && (
                                                    <p className="mt-2 text-emerald-600">
                                                        {event.breakFastDetails}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {event.DESCRIPTION && (
                                            <p className="mt-2 text-gray-700">{event.DESCRIPTION}</p>
                                        )}
                                    </div>
                                ))}
                                {filteredEvents.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">
                                        No events found matching your criteria
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CalendarUI;
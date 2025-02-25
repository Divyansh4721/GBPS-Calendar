import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getCalendarData } from './firebase';
import Header from '../components/header'
const CalendarView = ({ events, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3, 1));
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
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-white">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-purple-800 py-2">
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
            // Get the first event's image if there are events
            const eventImage = hasEvents && dayEvents[0].imageUrl ?
              `/GBPS-Calendar/${dayEvents[0].imageUrl}` :
              `/GBPS-Calendar/logo.png`;
            return (
              <button
                key={day}
                onClick={() => onSelectDate(date)}
                className={`h-12 p-1 relative rounded-lg transition-all overflow-hidden
                  ${isSelected
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                    : hasEvents
                      ? 'hover:bg-purple-100'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                {/* Background image for events */}
                {hasEvents && (
                  <div className="absolute inset-0 z-0 opacity-20">
                    <img
                      src={eventImage}
                      alt="Event"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {/* Day number with z-index to appear above the image */}
                <span className={`relative z-10 text-sm ${hasEvents && !isSelected ? 'font-bold text-purple-700' : ''}`}>
                  {day}
                </span>
                {/* Event indicators */}
                {hasEvents && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5 z-10">
                    {dayEvents.length > 1 ? (
                      <>
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`} />
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`} />
                      </>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const EventCard = ({ event }) => {
  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 border-purple-100 hover:shadow-xl transition-all duration-300 bg-white group"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="min-w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md overflow-hidden">
            <img
              src={`/GBPS-Calendar/${event.imageUrl ? event.imageUrl : 'logo.png'}`}
              alt="Event"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">{event.formattedDate}</p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                <h2 className="text-xl font-bold text-purple-800 mb-1">{event.sumhindi}</h2>
                <h3 className="text-lg text-pink-700">{event.sumenglish}</h3>
              </div>
              {(event.remarkhindi || event.remarkenglish) && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg">
                  {event.remarkhindi && (
                    <p className="mb-2 text-amber-800">
                      {event.remarkhindi}
                    </p>
                  )}
                  {event.remarkenglish && (
                    <p className="text-amber-700">
                      {event.remarkenglish}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const EnhancedCalendarUI = () => {
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
  const handleSearchChange = (e) => {
    setSelectedSummary('');
    setSelectedDate(null);
    setSearchTerm(e.target.value);
  };
  const handleSummaryChange = (e) => {
    setSearchTerm('');
    setSelectedDate(null);
    setSelectedSummary(e.target.value);
  };
  const parseEvents = (eventPayloads) => {
    function formatDate(date) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[date.getDay()];
      const dayNumber = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName}, ${dayNumber} ${monthName} ${year}`;
    }
    return eventPayloads.map(payload => {
      const event = {};
      event.id = payload.id;
      if (payload.date) {
        event.dateObj = new Date(
          payload.date.slice(0, 4),
          parseInt(payload.date.slice(4, 6)) - 1,
          payload.date.slice(6, 8)
        );
        event.formattedDate = formatDate(event.dateObj);
      }
      if (payload.sumenglish) {
        event.sumenglish = payload.sumenglish;
      }
      if (payload.sumhindi) {
        event.sumhindi = payload.sumhindi;
      }
      if (payload.remarkenglish) {
        event.remarkenglish = payload.remarkenglish;
      }
      if (payload.remarkhindi) {
        event.remarkhindi = payload.remarkhindi;
      }
      if (payload.imageURL) {
        event.imageURL = payload.imageURL;
      }
      return event;
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCalendarData();
        const parsedEvents = parseEvents(data);
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
  const filteredEvents = events.filter(event => {
    const summaryMatchesHindi = event.sumhindi?.includes(searchTerm);
    const descriptionMatchesHindi = event.remarkhindi?.includes(searchTerm);
    const summaryMatchesEnglish = event.sumenglish?.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatchesEnglish = event.remarkenglish?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = searchTerm === '' || summaryMatchesHindi || summaryMatchesEnglish || descriptionMatchesHindi || descriptionMatchesEnglish;
    const matchesSummary = !selectedSummary || event.sumenglish === selectedSummary;
    const matchesDate = !selectedDate || event.dateObj?.toDateString() === selectedDate.toDateString();
    return matchesSearch && matchesSummary && matchesDate;
  });
  const uniqueSummaries = [...new Set(events.map(event => event.sumenglish))];
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-64 py-12">
          <div className="text-xl text-purple-600 animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading calendar data...
          </div>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Header>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2">
            <p className="text-lg sm:text-xl md:text-2xl text-yellow-100 font-medium">श्री गौड़ीय वैष्णव व्रतोत्सव तालिका</p>
            <p className="text-base sm:text-lg md:text-xl text-yellow-100">श्री गौराब्द - 539 एवं विक्रमी सम्वत् 2082</p>
          </div>
        </Header>
        <div className="flex justify-center items-center min-h-64 py-12">
          <div className="text-xl text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-200">
            {error}
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2">
          <p className="text-lg sm:text-xl md:text-2xl text-yellow-100 font-medium">श्री गौड़ीय वैष्णव व्रतोत्सव तालिका</p>
          <p className="text-base sm:text-lg md:text-xl text-yellow-100">श्री गौराब्द - 539 एवं विक्रमी सम्वत् 2082</p>
        </div>
      </Header>
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
            <div className="mt-6 bg-white rounded-xl p-5 shadow-xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-10 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <Search className="absolute left-3 top-3.5 text-purple-400" size={20} />
              </div>
              <select
                value={selectedSummary}
                onChange={handleSummaryChange}
                className="w-full mt-4 p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Events</option>
                {uniqueSummaries.map(summary => (
                  <option key={summary} value={summary}>
                    {summary}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                  <div className="text-purple-300 mb-4">
                    <Calendar size={64} className="mx-auto" />
                  </div>
                  <p className="text-xl text-purple-800 font-medium">
                    No events found matching your criteria
                  </p>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your filters or selecting a different date
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EnhancedCalendarUI;
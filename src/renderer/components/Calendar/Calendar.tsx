import React, { useEffect, useState, useCallback } from 'react';
import { CalendarData, CalendarEvent } from '../../../shared/types';

/**
 * Calendar Component
 * Displays calendar events in a readable format
 */
export const Calendar: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle calendar data updates
  const handleCalendarUpdate = useCallback((data: CalendarData) => {
    setCalendarData(data);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await window.electronAPI.calendar.getEvents();
        if (response.success && response.data) {
          setCalendarData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch calendar data');
        }
      } catch (err) {
        setError('Failed to fetch calendar data');
      } finally {
        setLoading(false);
      }
    };

    // Start calendar sync
    const startSync = async () => {
      try {
        await window.electronAPI.calendar.startSync();
      } catch (err) {
        console.error('Failed to start calendar sync:', err);
      }
    };

    // Fetch initial data and start sync
    fetchInitialData();
    startSync();

    // Listen for calendar updates
    window.electronAPI.calendar.onDataUpdated(handleCalendarUpdate);

    // Cleanup
    return () => {
      window.electronAPI.calendar.stopSync();
      window.electronAPI.calendar.removeDataUpdatedListener(handleCalendarUpdate);
    };
  }, [handleCalendarUpdate]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate.toDateString() === today.toDateString();
  };

  const isUpcoming = (startDate: Date) => {
    const now = new Date();
    const eventStart = new Date(startDate);
    return eventStart > now;
  };

  const getEventsByDay = (events: CalendarEvent[]) => {
    const grouped = events.reduce((acc, event) => {
      const dateKey = new Date(event.startDate).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Sort each day's events by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="p-4 text-white/80 bg-black/20 backdrop-blur-sm rounded-lg">
        <div className="animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-300 bg-red-900/20 backdrop-blur-sm rounded-lg">
        <div className="text-sm font-medium">Calendar Error</div>
        <div className="text-xs mt-1">{error}</div>
      </div>
    );
  }

  if (!calendarData || calendarData.events.length === 0) {
    return (
      <div className="p-4 text-white/60 bg-black/20 backdrop-blur-sm rounded-lg">
        <div className="text-sm">No upcoming events</div>
      </div>
    );
  }

  const eventsByDay = getEventsByDay(calendarData.events);
  const sortedDays = Object.keys(eventsByDay).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="p-4 text-white bg-black/70 rounded-lg max-h-fit overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="text-xs text-white/60">
          {calendarData.totalEvents} events
        </div>
      </div>

      <div className="space-y-4">
        {sortedDays.map(day => {
          const dayEvents = eventsByDay[day];
          const dayDate = new Date(day);
          
          return (
            <div key={day} className="space-y-2">
              <div className={`text-sm font-medium px-2 py-1 rounded ${
                isToday(dayDate) 
                  ? 'bg-blue-500/30 text-blue-200' 
                  : 'bg-white/10 text-white/80'
              }`}>
                {isToday(dayDate) ? 'Today' : dayDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  className={`p-3 rounded border-l-2 ${
                    isUpcoming(event.startDate)
                      ? 'bg-green-900/20 border-green-400'
                      : 'bg-gray-900/20 border-gray-400'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="w-full">
                      <div className="font-medium text-sm">{event.title}</div>
                      {event.description && (
                        <div className="text-xs text-white/70 mt-1 line-clamp-2">
                          {event.description}
                        </div>
                      )}
                      {event.location && (
                        <div className="text-xs text-white/60 mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                    <div className="text-xs w-1/3 text-white/60 ml-2">
                      {event.isAllDay ? 'All day' : (
                        <>
                          {formatTime(event.startDate)}
                          {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() ? (
                            <> - {formatDate(event.endDate)}</>
                          ) : (
                            <> - {formatTime(event.endDate)}</>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-white/20 text-xs text-white/50">
        Last updated: {new Date(calendarData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}; 
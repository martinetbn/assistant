import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  CalendarData,
  CalendarEvent,
  StoredNotification,
} from "../../../shared/types";

interface NotificationTiming {
  timeMs: number;
  label: string;
}

interface ActiveNotification {
  id: string;
  event: CalendarEvent;
  timing: NotificationTiming;
  timestamp: number;
}

/**
 * Notification Component
 * Displays slide-down notifications for upcoming calendar events
 * with different timing schedules based on importance
 */
export const Notification: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [activeNotifications, setActiveNotifications] = useState<
    ActiveNotification[]
  >([]);
  const [notificationQueue, setNotificationQueue] = useState<
    ActiveNotification[]
  >([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(
    new Set()
  );

  // Notification timing schedules
  const IMPORTANT_TIMINGS: NotificationTiming[] = useMemo(
    () => [
      { timeMs: 30 * 24 * 60 * 60 * 1000, label: "1 month" }, // 1 month
      { timeMs: 7 * 24 * 60 * 60 * 1000, label: "1 week" }, // 1 week
      { timeMs: 5 * 24 * 60 * 60 * 1000, label: "5 days" }, // 5 days
      { timeMs: 3 * 24 * 60 * 60 * 1000, label: "3 days" }, // 3 days
      { timeMs: 2 * 24 * 60 * 60 * 1000, label: "2 days" }, // 2 days
      { timeMs: 1 * 24 * 60 * 60 * 1000, label: "1 day" }, // 1 day
      { timeMs: 12 * 60 * 60 * 1000, label: "12 hours" }, // 12 hours
      { timeMs: 6 * 60 * 60 * 1000, label: "6 hours" }, // 6 hours
      { timeMs: 3 * 60 * 60 * 1000, label: "3 hours" }, // 3 hours
      { timeMs: 1 * 60 * 60 * 1000, label: "1 hour" }, // 1 hour
      { timeMs: 30 * 60 * 1000, label: "30 minutes" }, // 30 minutes
      { timeMs: 10 * 60 * 1000, label: "10 minutes" }, // 10 minutes
    ],
    []
  );

  const REGULAR_TIMINGS: NotificationTiming[] = useMemo(
    () => [
      { timeMs: 1 * 60 * 60 * 1000, label: "1 hour" }, // 1 hour
      { timeMs: 30 * 60 * 1000, label: "30 minutes" }, // 30 minutes
      { timeMs: 10 * 60 * 1000, label: "10 minutes" }, // 10 minutes
    ],
    []
  );

  // Handle calendar data updates
  const handleCalendarUpdate = useCallback((data: CalendarData) => {
    setCalendarData(data);
    setLoading(false);
    setError(null);
  }, []);

  // Check if event is important (has [IMPORTANT] in description)
  const isImportantEvent = useCallback((event: CalendarEvent): boolean => {
    return event.description?.includes("[IMPORTANT]") || false;
  }, []);

  // Generate notification key
  const getNotificationKey = useCallback(
    (event: CalendarEvent, timing: NotificationTiming): string => {
      return `${event.id}-${timing.timeMs}`;
    },
    []
  );

  // Save notification to storage
  const saveNotificationToStorage = useCallback(
    async (event: CalendarEvent, timing: NotificationTiming) => {
      const notificationKey = getNotificationKey(event, timing);
      const now = new Date();
      const scheduledTime = new Date(
        new Date(event.startDate).getTime() - timing.timeMs
      );

      const storedNotification: StoredNotification = {
        id: notificationKey,
        eventId: event.id,
        eventTitle: event.title,
        eventDescription: event.description,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
        eventLocation: event.location,
        isImportant: isImportantEvent(event),
        timing,
        scheduledTime,
        createdAt: now,
        shown: false,
        dismissed: false,
      };

      try {
        await window.electronAPI.notificationStorage.save(storedNotification);
      } catch (error) {
        console.error("Failed to save notification to storage:", error);
      }
    },
    [getNotificationKey, isImportantEvent]
  );

  // Check for missed notifications from calendar data (one per event)
  const checkForMissedNotifications = useCallback(async () => {
    if (!calendarData?.events) return;

    console.log("Checking for missed notifications from calendar data...");
    const now = new Date().getTime();
    const missedNotifications: ActiveNotification[] = [];
    const processedEvents = new Set<string>(); // Track events we've already processed

    for (const event of calendarData.events) {
      // Skip if we already processed this event
      if (processedEvents.has(event.id)) continue;
      processedEvents.add(event.id);

      const eventStart = new Date(event.startDate).getTime();
      const isImportant = isImportantEvent(event);
      const timings = isImportant ? IMPORTANT_TIMINGS : REGULAR_TIMINGS;

      // Find the most recent missed notification for this event
      let mostRecentMissedTiming: NotificationTiming | null = null;
      let mostRecentNotificationTime = 0;

      for (const timing of timings) {
        const notificationTime = eventStart - timing.timeMs;
        const timeDiff = now - notificationTime;
        const isMissed = timeDiff > 5 * 60 * 1000; // More than 5 minutes late

        if (isMissed && notificationTime > mostRecentNotificationTime) {
          mostRecentNotificationTime = notificationTime;
          mostRecentMissedTiming = timing;
        }
      }

      // If we found a missed notification for this event
      if (mostRecentMissedTiming) {
        const notificationKey = getNotificationKey(
          event,
          mostRecentMissedTiming
        );

        try {
          const existsResponse =
            await window.electronAPI.notificationStorage.exists(
              notificationKey
            );
          const isDismissed = existsResponse.success && existsResponse.data;

          // Only add notification if it hasn't been dismissed before
          if (!isDismissed) {
            console.log(
              "Found missed notification:",
              notificationKey,
              "for event:",
              event.title,
              "timing:",
              mostRecentMissedTiming.label
            );

            // Save this missed notification to storage
            await saveNotificationToStorage(event, mostRecentMissedTiming);

            // Add to missed notifications
            missedNotifications.push({
              id: notificationKey,
              event,
              timing: mostRecentMissedTiming,
              timestamp: now,
            });

            // Mark as encountered in memory for this session
            setShownNotifications((prev) => new Set(prev).add(notificationKey));
          } else {
            console.log(
              "Skipping already dismissed notification:",
              notificationKey
            );
          }
        } catch (error) {
          console.error("Failed to check/save missed notification:", error);
        }
      }
    }

    if (missedNotifications.length > 0) {
      // Add to queue instead of showing all at once, but avoid duplicates
      setNotificationQueue((prev) => {
        const newQueue = [...prev];
        missedNotifications.forEach((missed) => {
          if (!newQueue.some((existing) => existing.id === missed.id)) {
            newQueue.push(missed);
          }
        });
        return newQueue;
      });
    }
  }, [
    calendarData,
    isImportantEvent,
    IMPORTANT_TIMINGS,
    REGULAR_TIMINGS,
    getNotificationKey,
    shownNotifications,
    saveNotificationToStorage,
  ]);

  // Check for due notifications (only current/future notifications, not missed ones)
  const checkForNotifications = useCallback(() => {
    if (!calendarData?.events) return;

    const now = new Date().getTime();
    const newNotifications: ActiveNotification[] = [];

    console.log("Checking for due notifications...");

    calendarData.events.forEach((event) => {
      const eventStart = new Date(event.startDate).getTime();
      const isImportant = isImportantEvent(event);
      const timings = isImportant ? IMPORTANT_TIMINGS : REGULAR_TIMINGS;

      timings.forEach((timing) => {
        const notificationTime = eventStart - timing.timeMs;
        const notificationKey = getNotificationKey(event, timing);

        // Only check for notifications that are due NOW (within 5 minutes of due time)
        // Explicitly exclude missed notifications (those are handled by checkForMissedNotifications)
        const timeDiff = now - notificationTime;
        const isWithinWindow = timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // 5 minutes window
        const isMissed = timeDiff > 5 * 60 * 1000; // More than 5 minutes late

        // Only process if within window AND not missed AND not already shown
        if (
          isWithinWindow &&
          !isMissed &&
          !shownNotifications.has(notificationKey)
        ) {
          // Check if this notification is already in queue or active
          const alreadyQueued = notificationQueue.some(
            (n) => n.id === notificationKey
          );
          const alreadyActive = activeNotifications.some(
            (n) => n.id === notificationKey
          );

          if (!alreadyQueued && !alreadyActive) {
            console.log(
              "Adding due notification:",
              notificationKey,
              "for event:",
              event.title
            );
            newNotifications.push({
              id: notificationKey,
              event,
              timing,
              timestamp: now,
            });

            // Mark as shown immediately to prevent re-processing
            setShownNotifications((prev) => new Set(prev).add(notificationKey));
          }
        }

        // Save future notifications to storage (only for truly future notifications)
        if (
          notificationTime > now + 5 * 60 * 1000 &&
          !shownNotifications.has(notificationKey)
        ) {
          saveNotificationToStorage(event, timing);
        }
      });
    });

    if (newNotifications.length > 0) {
      console.log(
        "Processing",
        newNotifications.length,
        "new due notifications"
      );
      // Add to queue if there are already active notifications, otherwise show directly
      if (activeNotifications.length > 0) {
        setNotificationQueue((prev) => {
          const newQueue = [...prev];
          newNotifications.forEach((newNotif) => {
            if (!newQueue.some((existing) => existing.id === newNotif.id)) {
              newQueue.push(newNotif);
            }
          });
          return newQueue;
        });
      } else {
        setActiveNotifications([newNotifications[0]]); // Show only first notification
        if (newNotifications.length > 1) {
          setNotificationQueue((prev) => {
            const newQueue = [...prev];
            newNotifications.slice(1).forEach((newNotif) => {
              if (!newQueue.some((existing) => existing.id === newNotif.id)) {
                newQueue.push(newNotif);
              }
            });
            return newQueue;
          });
        }
      }
    }
  }, [
    calendarData,
    isImportantEvent,
    IMPORTANT_TIMINGS,
    REGULAR_TIMINGS,
    getNotificationKey,
    shownNotifications,
    saveNotificationToStorage,
    activeNotifications,
    notificationQueue,
  ]);

  // Advance to next notification in queue
  const advanceQueue = useCallback(() => {
    setNotificationQueue((prev) => {
      if (prev.length > 0) {
        const newQueue = prev.slice(1); // Remove first item

        // Show next notification if available and no active notifications
        setTimeout(() => {
          if (newQueue.length > 0) {
            setActiveNotifications((current) => {
              if (current.length === 0) {
                return [newQueue[0]];
              }
              return current;
            });
          }
        }, 100); // Small delay to ensure state updates

        return newQueue;
      }
      return prev;
    });
  }, []);

  // Remove notification and advance queue
  const removeNotification = useCallback(
    async (notificationId: string) => {
      console.log("Removing notification:", notificationId);
      setActiveNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );

      // Mark as shown and dismissed in storage
      try {
        await window.electronAPI.notificationStorage.markShown(notificationId);
        await window.electronAPI.notificationStorage.markDismissed(
          notificationId
        );
        console.log("Marked notification as dismissed:", notificationId);
      } catch (error) {
        console.error("Failed to update notification status:", error);
      }

      // Keep the notification in shownNotifications to prevent re-showing
      // but don't clear it since we want to remember it was shown

      // Advance to next notification in queue
      advanceQueue();
    },
    [advanceQueue]
  );

  // Load missed notifications on startup
  const loadMissedNotifications = useCallback(async () => {
    try {
      const response =
        await window.electronAPI.notificationStorage.getUnshown();
      console.log("Loading missed notifications:", response.data?.length || 0);
      if (response.success && response.data && response.data.length > 0) {
        // Convert missed notifications to active notifications
        const missedActiveNotifications: ActiveNotification[] =
          response.data.map((stored) => ({
            id: stored.id,
            event: {
              id: stored.eventId,
              title: stored.eventTitle,
              description: stored.eventDescription,
              startDate: stored.eventStartDate,
              endDate: stored.eventEndDate,
              location: stored.eventLocation,
              isAllDay: false, // We'll assume false for stored notifications
              recurrence: undefined,
              status: "confirmed" as const,
              organizer: undefined,
              attendees: undefined,
            },
            timing: stored.timing,
            timestamp: new Date().getTime(),
          }));

        // Add missed notifications to queue instead of showing all at once
        if (missedActiveNotifications.length > 0) {
          setNotificationQueue((prev) => [
            ...missedActiveNotifications,
            ...prev,
          ]);

          // Mark all loaded notifications as shown (but not dismissed yet)
          for (const notification of response.data) {
            try {
              await window.electronAPI.notificationStorage.markShown(
                notification.id
              );
              // Add to in-memory tracking
              setShownNotifications((prev) =>
                new Set(prev).add(notification.id)
              );
            } catch (error) {
              console.error("Failed to mark notification as shown:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load missed notifications:", error);
    }
  }, []);

  // Process notification queue when queue changes and no active notifications
  useEffect(() => {
    if (notificationQueue.length > 0 && activeNotifications.length === 0) {
      console.log("Processing queue, showing first notification");
      setActiveNotifications([notificationQueue[0]]);
    }
  }, [notificationQueue, activeNotifications]);

  // Auto-remove notifications after 10 seconds
  useEffect(() => {
    if (activeNotifications.length === 0) return;

    const notification = activeNotifications[0]; // Only handle the first (current) notification
    const timer = setTimeout(() => {
      console.log("Auto-removing notification:", notification.id);
      removeNotification(notification.id);
    }, 10000); // 10 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [activeNotifications, removeNotification]);

  // Check for missed notifications only once when calendar data first loads
  const [hasCheckedMissed, setHasCheckedMissed] = useState(false);
  useEffect(() => {
    if (calendarData && !hasCheckedMissed) {
      console.log("First time checking for missed notifications");
      checkForMissedNotifications();
      setHasCheckedMissed(true);
    }
  }, [calendarData, checkForMissedNotifications, hasCheckedMissed]);

  // Check for notifications every minute
  useEffect(() => {
    const interval = setInterval(checkForNotifications, 60000); // Check every minute
    checkForNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [checkForNotifications]);

  // Initialize calendar data and load missed notifications
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await window.electronAPI.calendar.getEvents();
        if (response.success && response.data) {
          setCalendarData(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch calendar data");
        }
      } catch (err) {
        setError("Failed to fetch calendar data");
      } finally {
        setLoading(false);
      }
    };

    // Start calendar sync
    const startSync = async () => {
      try {
        await window.electronAPI.calendar.startSync();
      } catch (err) {
        console.error("Failed to start calendar sync:", err);
      }
    };

    // Initialize everything
    const initialize = async () => {
      // Load missed notifications first
      await loadMissedNotifications();

      // Then fetch calendar data and start sync
      await fetchInitialData();
      await startSync();
    };

    initialize();

    // Listen for calendar updates
    window.electronAPI.calendar.onDataUpdated(handleCalendarUpdate);

    // Cleanup
    return () => {
      window.electronAPI.calendar.stopSync();
      window.electronAPI.calendar.removeDataUpdatedListener(
        handleCalendarUpdate
      );
    };
  }, [handleCalendarUpdate, loadMissedNotifications]);

  // Format time remaining
  const formatTimeRemaining = useCallback(
    (event: CalendarEvent, timing: NotificationTiming): string => {
      const now = new Date().getTime();
      const eventStart = new Date(event.startDate).getTime();
      const timeUntilEvent = eventStart - now;
      const notificationTime = eventStart - timing.timeMs;
      const missedTime = now - notificationTime;

      if (timeUntilEvent <= 0) {
        return "event passed";
      }

      // Check if this is a missed notification (scheduled time was in the past)
      if (missedTime > 5 * 60 * 1000) {
        // More than 5 minutes late
        const hoursLate = Math.floor(missedTime / (1000 * 60 * 60));
        const daysLate = Math.floor(hoursLate / 24);

        if (daysLate > 0) {
          return `missed (${daysLate}d ago)`;
        } else if (hoursLate > 0) {
          return `missed (${hoursLate}h ago)`;
        } else {
          const minutesLate = Math.floor(missedTime / (1000 * 60));
          return `missed (${minutesLate}m ago)`;
        }
      }

      return `in ${timing.label}`;
    },
    []
  );

  // Render individual notification
  const renderNotification = (
    notification: ActiveNotification,
    index: number
  ) => {
    const { event, timing } = notification;
    const isImportant = isImportantEvent(event);
    const timeRemaining = formatTimeRemaining(event, timing);
    const isMissed = timeRemaining.includes("missed");

    return (
      <div
        key={notification.id}
        className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 z-50
          animate-slide-down shadow-2xl max-w-md w-full mx-4
          ${
            isMissed
              ? "bg-gradient-to-r from-red-600/30 to-red-800/60"
              : isImportant
              ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/50"
              : "bg-gradient-to-r from-blue-600/20 to-indigo-600/50"
          }
          text-white rounded-lg border border-white/20 backdrop-blur-sm
        `}
        style={{
          top: `${16 + index * 80}px`, // Stack notifications
          animationDelay: `${index * 100}ms`,
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {isMissed ? "⚠️" : isImportant ? "⏰" : "📅"}
                </span>
                <span className={`text-xs font-medium opacity-90`}>
                  {timeRemaining}
                </span>
              </div>

              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-xs opacity-90 line-clamp-2 mb-2">
                  {event.description.replace("[IMPORTANT]", "").trim()}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs opacity-80">
                <span>
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    📍 {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Don't render anything if there are no active notifications
  if (activeNotifications.length === 0) {
    return null;
  }

  // Only show the first notification (queue system ensures one at a time)
  const currentNotification = activeNotifications[0];

  return (
    <>
      {renderNotification(currentNotification, 0)}

      {/* Queue indicator */}
      {notificationQueue.length > 0 && (
        <div className="fixed top-20 right-4 z-40 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          +{notificationQueue.length} more
        </div>
      )}
    </>
  );
};

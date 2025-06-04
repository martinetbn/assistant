import ICAL from "ical.js";
import { CalendarEvent, CalendarData } from "../../shared/types";

/**
 * Calendar Service
 * Handles fetching and parsing iCal data from the SECRET_ICAL_ADDRESS environment variable
 */
export class CalendarService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastFetchedData: CalendarData | null = null;
  private readonly icalUrl: string;
  private readonly syncInterval: number = 2 * 60 * 1000; // 2 minutes in milliseconds

  constructor() {
    this.icalUrl = process.env.SECRET_ICAL_ADDRESS || "";
    if (!this.icalUrl) {
      console.warn("SECRET_ICAL_ADDRESS environment variable not set");
      console.warn("Please create a .env file in the project root with:");
      console.warn(
        "SECRET_ICAL_ADDRESS=https://calendar.google.com/calendar/ical/your-email%40gmail.com/private-token/basic.ics"
      );
    } else {
      console.log("Calendar service initialized with iCal URL");
    }
  }

  /**
   * Fetch and parse iCal data from the configured URL
   */
  async fetchCalendarData(): Promise<CalendarData> {
    if (!this.icalUrl) {
      throw new Error("iCal URL not configured");
    }

    try {
      const response = await fetch(this.icalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const icalData = await response.text();
      return this.parseICalData(icalData);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      throw error;
    }
  }

  /**
   * Parse iCal data string into CalendarData format
   */
  private parseICalData(icalData: string): CalendarData {
    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents("vevent");

      const events: CalendarEvent[] = vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);

        // Handle recurrence
        const rrule = vevent.getFirstPropertyValue("rrule");
        const recurrence = rrule ? rrule.toString() : undefined;

        // Handle organizer
        const organizerProp = vevent.getFirstProperty("organizer");
        const organizer = organizerProp
          ? {
              name: organizerProp.getParameter("cn") || undefined,
              email:
                organizerProp.getFirstValue()?.replace("mailto:", "") ||
                undefined,
            }
          : undefined;

        // Handle attendees
        const attendeeProps = vevent.getAllProperties("attendee");
        const attendees = attendeeProps.map((attendeeProp: any) => ({
          name: attendeeProp.getParameter("cn") || undefined,
          email:
            attendeeProp.getFirstValue()?.replace("mailto:", "") || undefined,
          status:
            (attendeeProp.getParameter("partstat")?.toLowerCase() as any) ||
            "needs-action",
        }));

        return {
          id: event.uid,
          title: event.summary || "Untitled Event",
          description: event.description || undefined,
          startDate: event.startDate.toJSDate(),
          endDate: event.endDate.toJSDate(),
          location: event.location || undefined,
          isAllDay: event.isRecurring() ? false : event.startDate.isDate,
          recurrence,
          status:
            (vevent.getFirstPropertyValue("status")?.toLowerCase() as any) ||
            "confirmed",
          organizer,
          attendees: attendees.length > 0 ? attendees : undefined,
        };
      });

      // Sort events by start date
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      // Filter to only include future events and events from the last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const filteredEvents = events.filter(
        (event) => event.endDate >= yesterday
      );

      console.log(
        `Parsed ${events.length} total events, showing ${filteredEvents.length} relevant events`
      );

      this.lastFetchedData = {
        events: filteredEvents,
        lastUpdated: new Date(),
        totalEvents: filteredEvents.length,
      };

      return this.lastFetchedData;
    } catch (error) {
      console.error("Error parsing iCal data:", error);
      throw new Error("Failed to parse calendar data");
    }
  }

  /**
   * Start periodic sync of calendar data
   */
  startPeriodicSync(callback?: (data: CalendarData) => void): void {
    if (this.intervalId) {
      this.stopPeriodicSync();
    }

    // Fetch immediately
    this.fetchCalendarData()
      .then((data) => {
        callback?.(data);
      })
      .catch((error) => {
        console.error("Initial calendar fetch failed:", error);
      });

    // Set up periodic fetching
    this.intervalId = setInterval(async () => {
      try {
        const data = await this.fetchCalendarData();
        callback?.(data);
      } catch (error) {
        console.error("Periodic calendar fetch failed:", error);
      }
    }, this.syncInterval);

    console.log(
      `Calendar sync started with ${this.syncInterval / 1000}s interval`
    );
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Calendar sync stopped");
    }
  }

  /**
   * Get the last fetched calendar data
   */
  getLastFetchedData(): CalendarData | null {
    return this.lastFetchedData;
  }

  /**
   * Check if calendar service is configured
   */
  isConfigured(): boolean {
    return !!this.icalUrl;
  }
}

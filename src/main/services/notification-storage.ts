import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { StoredNotification, NotificationStorage } from '../../shared/types';

/**
 * Notification Storage Service
 * Handles persistent storage of notifications in the user data directory
 */
export class NotificationStorageService {
  private readonly storageFile: string;
  private storage: NotificationStorage | null = null;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.storageFile = path.join(userDataPath, 'notifications.json');
    this.loadStorage();
  }

  /**
   * Load notification storage from file
   */
  private loadStorage(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const parsed = JSON.parse(data);
        
        // Convert date strings back to Date objects
        this.storage = {
          notifications: parsed.notifications.map((n: StoredNotification) => ({
            ...n,
            eventStartDate: new Date(n.eventStartDate),
            eventEndDate: new Date(n.eventEndDate),
            scheduledTime: new Date(n.scheduledTime),
            createdAt: new Date(n.createdAt),
          })),
          lastCleanup: new Date(parsed.lastCleanup),
        };
      } else {
        this.storage = {
          notifications: [],
          lastCleanup: new Date(),
        };
        this.saveStorage();
      }
    } catch (error) {
      console.error('Failed to load notification storage:', error);
      this.storage = {
        notifications: [],
        lastCleanup: new Date(),
      };
    }
  }

  /**
   * Save notification storage to file
   */
  private saveStorage(): void {
    if (!this.storage) return;

    try {
      const dataToSave = JSON.stringify(this.storage, null, 2);
      fs.writeFileSync(this.storageFile, dataToSave, 'utf8');
    } catch (error) {
      console.error('Failed to save notification storage:', error);
    }
  }

  /**
   * Save a new notification
   */
  saveNotification(notification: StoredNotification): void {
    if (!this.storage) return;

    // Remove existing notification with same ID if it exists
    this.storage.notifications = this.storage.notifications.filter(
      n => n.id !== notification.id
    );

    // Add the new notification
    this.storage.notifications.push(notification);
    this.saveStorage();
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): StoredNotification[] {
    return this.storage?.notifications || [];
  }

  /**
   * Get unshown notifications (missed notifications)
   */
  getUnshownNotifications(): StoredNotification[] {
    if (!this.storage) return [];

    const now = new Date();
    return this.storage.notifications.filter(
      n => !n.dismissed && n.scheduledTime <= now
    );
  }

  /**
   * Mark notification as shown
   */
  markAsShown(notificationId: string): void {
    if (!this.storage) return;

    const notification = this.storage.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.shown = true;
      this.saveStorage();
    }
  }

  /**
   * Mark notification as dismissed
   */
  markAsDismissed(notificationId: string): void {
    if (!this.storage) return;

    const notification = this.storage.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      this.saveStorage();
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  cleanupOldNotifications(): void {
    if (!this.storage) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const initialCount = this.storage.notifications.length;
    this.storage.notifications = this.storage.notifications.filter(
      n => n.createdAt > thirtyDaysAgo
    );

    const cleanedCount = initialCount - this.storage.notifications.length;
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old notifications`);
      this.storage.lastCleanup = new Date();
      this.saveStorage();
    }
  }

  /**
   * Auto cleanup if last cleanup was more than 24 hours ago
   */
  autoCleanupIfNeeded(): void {
    if (!this.storage) return;

    const now = new Date();
    const daysSinceLastCleanup = (now.getTime() - this.storage.lastCleanup.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastCleanup >= 1) {
      this.cleanupOldNotifications();
    }
  }

  /**
   * Check if notification has been dismissed (to avoid reshowing)
   */
  notificationExists(notificationId: string): boolean {
    if (!this.storage) return false;
    const notification = this.storage.notifications.find(n => n.id === notificationId);
    // Return true if notification exists and has been dismissed
    return notification ? notification.dismissed : false;
  }

  /**
   * Get specific notification by ID
   */
  getNotificationById(notificationId: string): StoredNotification | null {
    if (!this.storage) return null;
    return this.storage.notifications.find(n => n.id === notificationId) || null;
  }

  /**
   * Debug: Get all notifications with their status
   */
  getAllNotificationsDebug(): StoredNotification[] {
    return this.storage?.notifications || [];
  }
} 
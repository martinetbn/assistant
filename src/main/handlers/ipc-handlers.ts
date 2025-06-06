import { ipcMain, dialog, app, BrowserWindow, Notification } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-channels";
import { IPCResponse, SystemInfo, CalendarData, StoredNotification } from "../../shared/types";
import { CalendarService } from "../services/calendar-service";
import { NotificationStorageService } from "../services/notification-storage";
import fs from "fs";
import os from "os";

// Initialize services
const calendarService = new CalendarService();
const notificationStorage = new NotificationStorageService();

/**
 * Setup all IPC handlers for communication between main and renderer processes
 */
export const setupIpcHandlers = (): void => {
  // Window Management
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, async (): Promise<IPCResponse<void>> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow?.minimize();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, async (): Promise<IPCResponse<void>> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow?.isMaximized()) {
        focusedWindow.restore();
      } else {
        focusedWindow?.maximize();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (): Promise<IPCResponse<void>> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow?.close();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_BRING_TO_FRONT, async (): Promise<IPCResponse<void>> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        // Force window to front with highest priority
        focusedWindow.setAlwaysOnTop(true, 'screen-saver');
        focusedWindow.show();
        focusedWindow.focus();
        focusedWindow.moveTop();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_ALWAYS_ON_TOP, async (): Promise<IPCResponse<boolean>> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        const isCurrentlyOnTop = focusedWindow.isAlwaysOnTop();
        const newState = !isCurrentlyOnTop;
        
        if (newState) {
          focusedWindow.setAlwaysOnTop(true, 'screen-saver');
        } else {
          focusedWindow.setAlwaysOnTop(false);
        }
        
        return { success: true, data: newState };
      }
      return { success: false, error: 'No focused window found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // File Operations
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (): Promise<IPCResponse<string | null>> => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'JSON Files', extensions: ['json'] },
        ],
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: true, data: null };
      }

      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf8');
      
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_SAVE, async (event, content: string, filePath?: string): Promise<IPCResponse<string>> => {
    try {
      let saveFilePath = filePath;
      
      if (!saveFilePath) {
        const result = await dialog.showSaveDialog({
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, error: 'Save cancelled' };
        }

        saveFilePath = result.filePath;
      }

      fs.writeFileSync(saveFilePath, content, 'utf8');
      return { success: true, data: saveFilePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Application
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, async (): Promise<IPCResponse<string>> => {
    try {
      return { success: true, data: app.getVersion() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, async (): Promise<IPCResponse<void>> => {
    try {
      app.quit();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // System Information
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_INFO, async (): Promise<IPCResponse<SystemInfo>> => {
    try {
      const systemInfo: SystemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        version: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      };
      
      return { success: true, data: systemInfo };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Notifications
  ipcMain.handle(IPC_CHANNELS.SYSTEM_SHOW_NOTIFICATION, async (event, options: { title: string; body: string }): Promise<IPCResponse<void>> => {
    try {
      // Note: For cross-platform notifications, you might want to use a library like node-notifier
      // For now, we'll use Electron's built-in notification system
      const notification = new Notification({
        title: options.title,
        body: options.body,
      });
      
      notification.show();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Calendar Operations
  ipcMain.handle(IPC_CHANNELS.CALENDAR_GET_EVENTS, async (): Promise<IPCResponse<CalendarData>> => {
    try {
      if (!calendarService.isConfigured()) {
        return { success: false, error: 'Calendar service not configured. Please set SECRET_ICAL_ADDRESS environment variable.' };
      }

      // Return cached data if available, otherwise fetch fresh data
      const cachedData = calendarService.getLastFetchedData();
      if (cachedData) {
        return { success: true, data: cachedData };
      }

      const data = await calendarService.fetchCalendarData();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CALENDAR_START_SYNC, async (): Promise<IPCResponse<void>> => {
    try {
      if (!calendarService.isConfigured()) {
        return { success: false, error: 'Calendar service not configured. Please set SECRET_ICAL_ADDRESS environment variable.' };
      }

      calendarService.startPeriodicSync((data) => {
        // Broadcast calendar updates to all renderer windows
        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('calendar:data-updated', data);
        });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CALENDAR_STOP_SYNC, async (): Promise<IPCResponse<void>> => {
    try {
      calendarService.stopPeriodicSync();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Notification Storage Operations
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_SAVE, async (event, notification: StoredNotification): Promise<IPCResponse<void>> => {
    try {
      notificationStorage.saveNotification(notification);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_GET_ALL, async (): Promise<IPCResponse<StoredNotification[]>> => {
    try {
      const notifications = notificationStorage.getUnshownNotifications();
      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_MARK_SHOWN, async (event, notificationId: string): Promise<IPCResponse<void>> => {
    try {
      notificationStorage.markAsShown(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_MARK_DISMISSED, async (event, notificationId: string): Promise<IPCResponse<void>> => {
    try {
      notificationStorage.markAsDismissed(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_CLEANUP_OLD, async (): Promise<IPCResponse<void>> => {
    try {
      notificationStorage.cleanupOldNotifications();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_EXISTS, async (event, notificationId: string): Promise<IPCResponse<boolean>> => {
    try {
      const exists = notificationStorage.notificationExists(notificationId);
      return { success: true, data: exists };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Auto cleanup on startup
  notificationStorage.autoCleanupIfNeeded();
}; 
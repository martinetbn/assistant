// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc-channels';
import { IPCResponse, SystemInfo, NotificationOptions, CalendarData, StoredNotification } from '../shared/types';

/**
 * Electron API exposed to the renderer process
 */
const electronAPI = {
  // Window management
  window: {
    minimize: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    bringToFront: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_BRING_TO_FRONT),
    toggleAlwaysOnTop: (): Promise<IPCResponse<boolean>> => 
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_ALWAYS_ON_TOP),
  },

  // File operations
  file: {
    open: (): Promise<IPCResponse<string | null>> => 
      ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
    save: (content: string, filePath?: string): Promise<IPCResponse<string>> => 
      ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, content, filePath),
  },

  // Application
  app: {
    getVersion: (): Promise<IPCResponse<string>> => 
      ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
    quit: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),
  },

  // System
  system: {
    getInfo: (): Promise<IPCResponse<SystemInfo>> => 
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_INFO),
    showNotification: (options: NotificationOptions): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_SHOW_NOTIFICATION, options),
  },

  // Calendar
  calendar: {
    getEvents: (): Promise<IPCResponse<CalendarData>> => 
      ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GET_EVENTS),
    startSync: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_START_SYNC),
    stopSync: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_STOP_SYNC),
    onDataUpdated: (callback: (data: CalendarData) => void) => {
      ipcRenderer.on('calendar:data-updated', (_, data) => callback(data));
    },
    removeDataUpdatedListener: (callback: (data: CalendarData) => void) => {
      ipcRenderer.removeListener('calendar:data-updated', callback as never);
    },
  },

  // Notification Storage
  notificationStorage: {
    save: (notification: StoredNotification): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SAVE, notification),
    getUnshown: (): Promise<IPCResponse<StoredNotification[]>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_GET_ALL),
    markShown: (notificationId: string): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_MARK_SHOWN, notificationId),
    markDismissed: (notificationId: string): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_MARK_DISMISSED, notificationId),
    cleanup: (): Promise<IPCResponse<void>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_CLEANUP_OLD),
    exists: (notificationId: string): Promise<IPCResponse<boolean>> => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_EXISTS, notificationId),
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the window object (will be used in renderer)
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

/**
 * IPC Channel Constants
 * Centralized definition of all IPC communication channels
 */

export const IPC_CHANNELS = {
  // Window Management
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_RESTORE: 'window:restore',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  WINDOW_BRING_TO_FRONT: 'window:bring-to-front',
  WINDOW_TOGGLE_ALWAYS_ON_TOP: 'window:toggle-always-on-top',
  
  // File Operations
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_NEW: 'file:new',
  
  // Application
  APP_GET_VERSION: 'app:get-version',
  APP_GET_PATH: 'app:get-path',
  APP_QUIT: 'app:quit',
  APP_RESTART: 'app:restart',
  
  // System
  SYSTEM_GET_INFO: 'system:get-info',
  SYSTEM_SHOW_NOTIFICATION: 'system:show-notification',
  
  // Calendar
  CALENDAR_GET_EVENTS: 'calendar:get-events',
  CALENDAR_START_SYNC: 'calendar:start-sync',
  CALENDAR_STOP_SYNC: 'calendar:stop-sync',
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]; 
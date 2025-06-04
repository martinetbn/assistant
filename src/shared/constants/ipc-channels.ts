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
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]; 
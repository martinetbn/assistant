// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc-channels';
import { IPCResponse, SystemInfo, NotificationOptions } from '../shared/types';

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
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the window object (will be used in renderer)
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

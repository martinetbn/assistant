import { ipcMain, dialog, app, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-channels";
import { IPCResponse, SystemInfo, FileInfo } from "../../shared/types";
import fs from "fs";
import path from "path";
import os from "os";

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
      const notification = new (require('electron').Notification)({
        title: options.title,
        body: options.body,
      });
      
      notification.show();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}; 
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { APP_CONFIG } from "../../shared/constants/app-constants";

/**
 * Create and configure the main application window
 */
export const createMainWindow = (options: Partial<BrowserWindowConstructorOptions> = {}): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: APP_CONFIG.DEFAULT_WINDOW.WIDTH,
    height: APP_CONFIG.DEFAULT_WINDOW.HEIGHT,
    minWidth: APP_CONFIG.DEFAULT_WINDOW.MIN_WIDTH,
    minHeight: APP_CONFIG.DEFAULT_WINDOW.MIN_HEIGHT,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false, // Security: Disable node integration
      contextIsolation: true, // Security: Enable context isolation
      ...options.webPreferences,
    },
    titleBarStyle: 'default',
    ...options,
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}; 
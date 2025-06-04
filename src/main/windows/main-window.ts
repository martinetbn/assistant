import { BrowserWindow, BrowserWindowConstructorOptions, screen } from "electron";

/**
 * Create and configure the main application window
 */
export const createMainWindow = (options: Partial<BrowserWindowConstructorOptions> = {}): BrowserWindow => {
  // Get the primary display dimensions for fullscreen
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    show: false, // Don't show until ready
    transparent: true, // Make window transparent
    frame: false, // Remove window frame for better transparency
    alwaysOnTop: true, // Keep window always on top
    skipTaskbar: true, // Don't show in taskbar
    resizable: false, // Disable resizing for consistent behavior
    fullscreen: false, // Don't use fullscreen mode (we want manual control)
    kiosk: false,
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

  // Make window completely click-through so interactions pass to windows below
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  return mainWindow;
}; 
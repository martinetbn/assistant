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

  // Enhanced always-on-top with higher priority level
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Re-enforce always-on-top after showing
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  // Make window completely click-through so interactions pass to windows below
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Monitor and maintain always-on-top status
  const enforceAlwaysOnTop = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  };

  // Re-enforce always-on-top on various events
  mainWindow.on('focus', enforceAlwaysOnTop);
  mainWindow.on('show', enforceAlwaysOnTop);
  mainWindow.on('restore', enforceAlwaysOnTop);

  // Periodic check to ensure window stays on top (every 2 seconds)
  const alwaysOnTopInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else if (mainWindow && mainWindow.isDestroyed()) {
      clearInterval(alwaysOnTopInterval);
    }
  }, 2000);

  // Clean up interval when window is closed
  mainWindow.on('closed', () => {
    clearInterval(alwaysOnTopInterval);
  });

  return mainWindow;
}; 
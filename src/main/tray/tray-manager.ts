import {
  Tray,
  Menu,
  nativeImage,
  app,
  BrowserWindow,
  Notification,
} from "electron";
import path from "path";

let tray: Tray | null = null;

/**
 * Create and configure the system tray
 */
export const createTray = (mainWindow: BrowserWindow | null): Tray => {
  // Create tray icon
  const iconPath = path.join(
    __dirname,
    "../../assets/assistant-small-icon.png"
  );
  const trayIcon = nativeImage.createFromPath(iconPath);

  // Resize icon for tray (16x16 is standard for system tray)
  const resizedIcon = trayIcon.resize({ width: 16, height: 16 });

  tray = new Tray(resizedIcon);

  // Set tooltip
  tray.setToolTip("Assistant - Background Helper");

  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Assistant",
      type: "normal",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Hide Assistant",
      type: "normal",
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      },
    },
    {
      type: "separator",
    },
    {
      type: "separator",
    },
    {
      label: "Quit Assistant",
      type: "normal",
      click: () => {
        app.quit();
      },
    },
  ]);

  // Set context menu
  tray.setContextMenu(contextMenu);

  // Handle double-click to show/hide window
  tray.on("double-click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return tray;
};

/**
 * Destroy the system tray
 */
export const destroyTray = (): void => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
};

/**
 * Get the current tray instance
 */
export const getTray = (): Tray | null => {
  return tray;
};

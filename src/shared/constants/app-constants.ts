/**
 * Application Constants
 * Global constants used throughout the application
 */

export const APP_CONFIG = {
  // Application Info
  NAME: "Assistant",
  VERSION: "1.0.0",
  DESCRIPTION: "A transparent background assistant application",

  // Window Configuration
  DEFAULT_WINDOW: {
    WIDTH: 400,
    HEIGHT: 300,
    MIN_WIDTH: 300,
    MIN_HEIGHT: 200,
  },

  // Development
  DEV_TOOLS: process.env.NODE_ENV === "development",

  // Paths
  ASSETS_PATH: "assets",
  USER_DATA_PATH: "userData",

  // UI
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
} as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const SUPPORTED_FILE_TYPES = {
  TEXT: [".txt", ".md", ".json"],
  IMAGE: [".png", ".jpg", ".jpeg", ".gif", ".svg"],
  DOCUMENT: [".pdf", ".doc", ".docx"],
} as const;

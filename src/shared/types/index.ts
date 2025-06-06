/**
 * Shared Type Definitions
 * Types used across main, renderer, and preload processes
 */

import { Theme } from '../constants/app-constants';

// Application State
export interface AppState {
  theme: Theme;
  isFullscreen: boolean;
  isMaximized: boolean;
  windowSize: {
    width: number;
    height: number;
  };
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  autoSave: boolean;
  notifications: boolean;
}

// File System
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface SaveFileOptions {
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

// System Information
export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  totalMemory: number;
  freeMemory: number;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  isAllDay: boolean;
  recurrence?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer?: {
    name?: string;
    email?: string;
  };
  attendees?: Array<{
    name?: string;
    email?: string;
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  }>;
}

export interface CalendarData {
  events: CalendarEvent[];
  lastUpdated: Date;
  totalEvents: number;
}

// IPC Message Types
export interface IPCMessage<T = any> {
  channel: string;
  data: T;
  id?: string;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Notification
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
}

export interface StoredNotification {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventStartDate: Date;
  eventEndDate: Date;
  eventLocation?: string;
  isImportant: boolean;
  timing: {
    timeMs: number;
    label: string;
  };
  scheduledTime: Date;
  createdAt: Date;
  shown: boolean;
  dismissed: boolean;
}

export interface NotificationStorage {
  notifications: StoredNotification[];
  lastCleanup: Date;
}

// Window Events
export interface WindowEvent {
  type: 'minimize' | 'maximize' | 'restore' | 'close' | 'resize';
  timestamp: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

// API Response Types
export type APIResponse<T> = Promise<IPCResponse<T>>;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 
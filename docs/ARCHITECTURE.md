# Architecture Documentation

## Overview

This document outlines the technical architecture and design decisions for the Assistant project.

## Core Architecture Principles

### 1. Process Separation
- **Main Process**: System-level operations, native APIs, window management
- **Renderer Process**: UI rendering, React components, application logic
- **Preload Scripts**: Secure communication bridge between processes

### 2. Type Safety
- Comprehensive TypeScript usage across all processes
- Strict type checking enabled
- Shared type definitions for cross-process communication

### 3. Security First
- Context isolation enabled by default
- Secure IPC communication patterns
- Minimal API surface exposure

### 4. Scalability
- Modular component architecture
- Feature-based organization
- Clear separation of concerns

## Project Structure Details

### Main Process (`src/main/`)

The main process is responsible for:
- Application lifecycle management
- Window creation and management
- Native OS interactions
- File system operations
- System-level event handling

```typescript
// Main process structure
src/main/
├── index.ts              # Entry point
├── windows/
│   ├── main-window.ts    # Main window configuration
│   └── window-manager.ts # Window management utilities
├── menu/
│   ├── application-menu.ts
│   └── context-menu.ts
├── handlers/
│   ├── file-handler.ts   # File operations
│   └── ipc-handlers.ts   # IPC communication handlers
└── utils/
    ├── app-config.ts     # Application configuration
    └── security.ts       # Security utilities
```

### Renderer Process (`src/renderer/`)

The renderer process handles:
- React component rendering
- User interface logic
- State management
- API calls and data processing

```typescript
// Renderer process structure
src/renderer/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Layout/
│   ├── features/         # Feature-specific components
│   │   ├── Dashboard/
│   │   ├── Settings/
│   │   └── UserProfile/
│   └── pages/           # Page-level components
│       ├── Home/
│       ├── About/
│       └── Settings/
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
├── services/            # API and business logic
├── utils/               # Utility functions
├── styles/              # Global styles and Tailwind
├── types/               # Renderer-specific types
├── App.tsx              # Main application component
└── index.tsx            # Renderer entry point
```

### Preload Scripts (`src/preload/`)

Preload scripts provide:
- Secure API exposure to renderer
- IPC communication setup
- Context bridge implementation

```typescript
// Preload structure
src/preload/
├── index.ts             # Main preload script
├── api/
│   ├── file-api.ts      # File operations API
│   ├── system-api.ts    # System information API
│   └── window-api.ts    # Window control API
├── types/
│   └── electron-api.ts  # API type definitions
└── utils/
    └── bridge-utils.ts  # Context bridge utilities
```

### Shared Code (`src/shared/`)

Shared utilities and types:
- Common type definitions
- Shared constants
- Utility functions used across processes

```typescript
// Shared structure
src/shared/
├── types/
│   ├── ipc.ts           # IPC message types
│   ├── app.ts           # Application types
│   └── user.ts          # User-related types
├── constants/
│   ├── app-constants.ts # Application constants
│   └── ipc-channels.ts  # IPC channel definitions
└── utils/
    ├── validation.ts    # Data validation utilities
    └── formatters.ts    # Data formatting utilities
```

## Communication Patterns

### IPC Communication

```typescript
// Define IPC channels in shared constants
export const IPC_CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
} as const;

// Main process handler
ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'All Files', extensions: ['*'] }]
  });
  return result;
});

// Preload script exposure
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
  saveFile: (data: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, data),
});

// Renderer usage
const { electronAPI } = window;
const fileResult = await electronAPI.openFile();
```

### State Management

#### Local Component State
```typescript
// Simple state
const [count, setCount] = useState(0);

// Complex state with reducer
const [state, dispatch] = useReducer(reducer, initialState);
```

#### Global State with Context
```typescript
// Context definition
const AppContext = createContext<AppContextType | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### Error Handling

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to logging service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### Async Error Handling
```typescript
// Custom hook for async operations
const useAsyncOperation = <T>(
  operation: () => Promise<T>
): [T | null, boolean, Error | null, () => void] => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return [data, loading, error, execute];
};
```

## Security Considerations

### Context Isolation
- Always enable context isolation in BrowserWindow
- Use preload scripts for secure API exposure
- Never disable Node.js integration in renderer

### IPC Security
- Validate all data received via IPC
- Use type-safe communication patterns
- Limit exposed APIs to minimum required

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https:;
">
```

## Performance Considerations

### Code Splitting
```typescript
// Lazy loading components
const Settings = React.lazy(() => import('./components/pages/Settings'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <Settings />
</Suspense>
```

### Memoization
```typescript
// Expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Callback memoization
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Bundle Optimization
- Tree shaking enabled
- Code splitting for large components
- Optimize imports to reduce bundle size

## Testing Strategy

### Unit Testing
```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// Main process testing
import { app } from 'electron';
import { createWindow } from '../main/windows/main-window';

describe('Main Process', () => {
  beforeAll(async () => {
    await app.whenReady();
  });

  it('creates main window', () => {
    const window = createWindow();
    expect(window).toBeDefined();
  });
});
```

## Build and Deployment

### Development Build
- Webpack dev server for hot reload
- Source maps for debugging
- Development-specific configurations

### Production Build
- Minification and optimization
- Tree shaking for smaller bundles
- Platform-specific optimizations

### Distribution
- Cross-platform build support
- Code signing for security
- Auto-updater integration

## Monitoring and Logging

### Error Tracking
```typescript
// Centralized error logging
class ErrorLogger {
  static log(error: Error, context?: string) {
    console.error(`[${context || 'Unknown'}]`, error);
    // Send to monitoring service
  }
}
```

### Performance Monitoring
```typescript
// Performance metrics
const performanceMonitor = {
  measureRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  }
};
```

## Migration and Upgrades

### Version Compatibility
- Maintain backwards compatibility
- Clear migration guides
- Automated upgrade scripts

### Dependency Management
- Regular security updates
- Controlled dependency versions
- Compatibility testing

---

This architecture provides a solid foundation for building scalable, maintainable, and secure Electron applications with modern web technologies. 
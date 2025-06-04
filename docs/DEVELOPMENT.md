# Development Guidelines

This document provides detailed guidelines for developing with the Assistant project.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Component Development](#component-development)
- [State Management](#state-management)
- [IPC Communication](#ipc-communication)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- Git

### Installation

```bash
git clone <your-repo-url>
cd assistant
npm install
```

### Development Commands

```bash
# Start development server
npm start

# Build for production
npm run package

# Create distributables
npm run make

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── main/                 # Electron main process
│   ├── index.ts         # Main process entry point
│   ├── windows/         # Window management
│   └── handlers/        # IPC handlers
├── renderer/            # React renderer process
│   ├── components/      # React components
│   │   ├── common/      # Reusable components
│   │   ├── features/    # Feature-specific components
│   │   └── pages/       # Page components
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React Context providers
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   └── types/           # Renderer-specific types
├── preload/             # Preload scripts
│   ├── index.ts         # Main preload script
│   └── api/             # API definitions
└── shared/              # Shared code
    ├── types/           # Shared types
    ├── constants/       # Constants
    └── utils/           # Shared utilities
```

## Development Workflow

### Branch Strategy

Use feature branches for development:

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### Commit Messages

Follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance tasks

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Use type assertions sparingly
- Prefer `interface` over `type` for object shapes

```typescript
// ✅ Good
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// ❌ Avoid
const user: any = { id: 1, name: 'John' };
```

### React

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization when needed
- Follow the single responsibility principle

```typescript
// ✅ Good
export default function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};
```

### Styling

- Use Tailwind CSS utility classes
- Create custom components for repeated patterns
- Use CSS modules for complex custom styles
- Follow mobile-first responsive design

```typescript
// ✅ Good
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// ❌ Avoid
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Click me
</button>
```

## Component Development

### Component Structure

Each component should have its own directory:

```
components/common/Button/
├── Button.tsx           # Component implementation
├── Button.types.ts      # TypeScript types
├── Button.test.tsx      # Tests
└── index.ts             # Exports
```

### Component Template

```typescript
import React from 'react';
import { ComponentProps } from './Component.types';

/**
 * Component description
 */
export default function Component({
  prop1,
  prop2,
  ...props
}: ComponentProps) {
  // Component logic here
  
  return (
    <div className="component-class" {...props}>
      {/* Component JSX */}
    </div>
  );
};
```

### Props Interface

```typescript
export interface ComponentProps {
  // Required props
  id: string;
  title: string;
  
  // Optional props
  description?: string;
  disabled?: boolean;
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  
  // HTML attributes
  className?: string;
  children?: React.ReactNode;
}
```

## State Management

### Local State

Use `useState` for component-level state:

```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### Complex State

Use `useReducer` for complex state logic:

```typescript
interface State {
  loading: boolean;
  data: Data | null;
  error: string | null;
}

type Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Data }
  | { type: 'FETCH_ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
```

### Global State

Use React Context for app-wide state:

```typescript
interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## IPC Communication

### Channel Definition

Define all IPC channels in shared constants:

```typescript
export const IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'window:minimize',
  FILE_OPEN: 'file:open',
  // ... other channels
} as const;
```

### Main Process Handler

```typescript
ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (): Promise<IPCResponse<string>> => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
    });
    
    if (result.canceled) {
      return { success: false, error: 'Operation cancelled' };
    }
    
    return { success: true, data: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});
```

### Preload Script

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<IPCResponse<string>> => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
});
```

### Renderer Usage

```typescript
const handleOpenFile = async () => {
  try {
    const response = await window.electronAPI.openFile();
    if (response.success) {
      console.log('File opened:', response.data);
    } else {
      console.error('Error:', response.error);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
  }
};
```

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
import { app } from 'electron';
import { createMainWindow } from '../windows/main-window';

describe('Main Process', () => {
  beforeAll(async () => {
    await app.whenReady();
  });
  
  it('creates main window', () => {
    const window = createMainWindow();
    expect(window).toBeDefined();
    expect(window.isVisible()).toBe(false); // Should not show until ready
  });
});
```

## Performance

### Code Splitting

```typescript
// Lazy load components
const Settings = React.lazy(() => import('./pages/Settings'));

// Use with Suspense
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

// Component memoization
export default React.memo(Component);
```

### Bundle Optimization

- Use tree shaking
- Optimize imports
- Minimize bundle size
- Use production builds

## Security

### Context Isolation

Always enable context isolation:

```typescript
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

### IPC Security

- Validate all IPC data
- Use type-safe communication
- Limit exposed APIs
- Never expose sensitive operations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
">
```

## Best Practices

1. **Keep components small and focused**
2. **Use TypeScript strictly**
3. **Write tests for critical functionality**
4. **Follow security guidelines**
5. **Optimize for performance**
6. **Document complex logic**
7. **Use consistent naming conventions**
8. **Handle errors gracefully**
9. **Keep dependencies up to date**
10. **Review code before merging**

---

For more information, refer to the [Architecture Documentation](../ARCHITECTURE.md) and [README](../README.md). 
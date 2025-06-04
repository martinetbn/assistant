# Assistant

A modern assistant desktop application made with **Electron**, **React**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Features

- ⚡ **Electron** - Build cross-platform desktop apps
- ⚛️ **React 18** - Modern UI library with hooks and concurrent features
- 🔷 **TypeScript** - Type-safe development experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Webpack** - Module bundler with hot reload
- 🔧 **Electron Forge** - Complete toolchain for Electron apps
- 📏 **ESLint** - Code linting and formatting
- 🏗️ **Modern Architecture** - Clean, scalable project structure

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd electron-react-typescript-tailwind-starter
npm install
```

### 2. Development

```bash
npm start
```

This will start the Electron app in development mode with hot reload enabled.

### 3. Build and Package

```bash
# Package for current platform
npm run package

# Create distributable installers
npm run make

# Lint code
npm run lint
```

## 📁 Project Structure

```
electron-react-typescript-tailwind-starter/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main process entry point
│   │   └── windows/       # Window management
│   ├── renderer/          # React renderer process
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Global styles and Tailwind
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main React component
│   │   └── index.tsx      # Renderer entry point
│   ├── preload/           # Preload scripts
│   │   └── index.ts       # Preload script entry
│   └── shared/            # Shared utilities between processes
│       ├── constants/     # Application constants
│       ├── types/         # Shared TypeScript types
│       └── utils/         # Shared utility functions
├── assets/                # Static assets
├── docs/                  # Documentation
├── webpack/               # Webpack configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🏗️ Architecture

### Core Principles

1. **Separation of Concerns** - Clear separation between main process, renderer process, and preload scripts
2. **Type Safety** - Comprehensive TypeScript usage throughout the application
3. **Component-Based** - Modular React components with single responsibility
4. **Utility-First Styling** - Tailwind CSS for consistent and maintainable styles
5. **Security First** - Proper IPC communication and context isolation

### Process Architecture

#### Main Process (`src/main/`)
- **Responsibility**: System-level operations, window management, native APIs
- **Entry Point**: `src/main/index.ts`
- **Key Functions**:
  - Application lifecycle management
  - Window creation and management
  - Native OS interactions
  - File system operations

#### Renderer Process (`src/renderer/`)
- **Responsibility**: UI rendering, user interactions, application logic
- **Entry Point**: `src/renderer/index.tsx`
- **Key Functions**:
  - React component rendering
  - State management
  - User interface logic
  - API calls and data processing

#### Preload Scripts (`src/preload/`)
- **Responsibility**: Secure bridge between main and renderer processes
- **Entry Point**: `src/preload/index.ts`
- **Key Functions**:
  - Expose safe APIs to renderer
  - IPC communication setup
  - Security boundary enforcement

### Component Architecture

#### Component Organization
```
src/renderer/components/
├── common/           # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── Layout/
├── features/         # Feature-specific components
│   ├── UserProfile/
│   ├── Dashboard/
│   └── Settings/
└── pages/           # Page-level components
    ├── Home/
    ├── About/
    └── Settings/
```

#### Component Standards
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Follow single responsibility principle
- Include comprehensive error boundaries
- Use Tailwind CSS for styling

### State Management

#### Local State
- Use `useState` for component-level state
- Use `useReducer` for complex state logic
- Implement custom hooks for reusable state logic

#### Global State
- Context API for app-wide state
- Consider Redux Toolkit for complex applications
- Local storage for persistence when needed

## 🎨 Styling Guidelines

### Tailwind CSS Usage

#### Utility Classes
```tsx
// ✅ Good: Utility-first approach
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>

// ❌ Avoid: Inline styles
<button style={{backgroundColor: 'blue', color: 'white'}}>
  Click me
</button>
```

#### Responsive Design
```tsx
// Mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive container
</div>
```

#### Custom Styles
- Extend Tailwind config for project-specific utilities
- Use CSS modules for complex custom styles
- Create reusable component classes

## 🔒 Security Best Practices

### IPC Communication
```typescript
// In preload script
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose only necessary APIs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data: string) => ipcRenderer.invoke('file:save', data),
});
```

### Context Isolation
- Always enable context isolation
- Use preload scripts for secure API exposure
- Validate all data between processes

## 📚 Development Guidelines

### Code Style
- Use ESLint configuration provided
- Follow TypeScript strict mode
- Implement proper error handling
- Write self-documenting code

### Git Workflow
```bash
# Feature branch workflow
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

## 🧪 Testing

### Setup Testing Framework
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Test Structure
```
src/
├── __tests__/          # Global tests
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
```

## 📦 Building and Distribution

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run package
```

### Distribution
```bash
npm run make
```

### Supported Platforms
- Windows (NSIS, Squirrel)
- macOS (DMG, ZIP)
- Linux (DEB, RPM, AppImage)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Development server won't start
```bash
# Clear webpack cache
rm -rf .webpack
npm start
```

#### TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

#### Electron packaging fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Electron Forge Documentation](https://www.electronforge.io/)

---

**Happy coding! 🚀** 
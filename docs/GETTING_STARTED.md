# Getting Started

Welcome to the Assistant project! This guide will help you get up and running quickly.

## Quick Start

### 1. Prerequisites

Make sure you have the following installed:

- **Node.js** >= 16.x ([Download](https://nodejs.org/))
- **npm** >= 8.x (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd assistant

# Install dependencies
npm install
```

### 3. Development

```bash
# Start the development server
npm start
```

This will:
- Start the Electron app in development mode
- Enable hot reload for the renderer process
- Open DevTools automatically
- Watch for file changes

### 4. Building

```bash
# Package the app for your current platform
npm run package

# Create distributable installers
npm run make
```

## Project Overview

- **Electron** - Cross-platform desktop app framework
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Webpack** - Module bundler with hot reload
- **Electron Forge** - Complete toolchain for Electron apps

## Architecture Overview

The project follows a clean, scalable architecture:

```
src/
├── main/          # Electron main process (Node.js)
├── renderer/      # React UI (Browser context)
├── preload/       # Secure bridge between processes
└── shared/        # Code shared between processes
```

### Key Concepts

1. **Process Separation**: Main process handles system operations, renderer handles UI
2. **Security First**: Context isolation and secure IPC communication
3. **Type Safety**: Comprehensive TypeScript usage
4. **Component Architecture**: Modular, reusable React components

## Your First Changes

### 1. Update App Information

Edit `src/shared/constants/app-constants.ts`:

```typescript
export const APP_CONFIG = {
  NAME: 'Your App Name',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your app description',
  // ...
};
```

### 2. Customize the UI

The main UI is in `src/renderer/App.tsx`. You can:

- Modify the existing layout
- Add new components
- Update styling with Tailwind CSS

### 3. Add New Features

Create new components in `src/renderer/components/`:

```typescript
// src/renderer/components/features/MyFeature/MyFeature.tsx
import React from 'react';

export const MyFeature: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">My Feature</h2>
      <p>Feature content here...</p>
    </div>
  );
};
```

### 4. Add IPC Communication

To communicate between main and renderer processes:

1. **Define channels** in `src/shared/constants/ipc-channels.ts`
2. **Add handlers** in `src/main/handlers/ipc-handlers.ts`
3. **Expose APIs** in `src/preload/index.ts`
4. **Use in renderer** via `window.electronAPI`

## Development Workflow

### 1. Feature Development

```bash
# Create a feature branch
git checkout -b feature/my-new-feature

# Make your changes
# ...

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-new-feature
```

### 2. Code Quality

```bash
# Lint your code
npm run lint

# Type check
npx tsc --noEmit

# Format code (if you have Prettier)
npm run format
```

### 3. Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Common Tasks

### Adding Dependencies

```bash
# Production dependencies
npm install package-name

# Development dependencies
npm install --save-dev package-name
```

### Window Management

The app includes built-in window controls:

```typescript
// Minimize window
await window.electronAPI.window.minimize();

// Maximize/restore window
await window.electronAPI.window.maximize();

// Close window
await window.electronAPI.window.close();
```

### File Operations

```typescript
// Open file dialog
const response = await window.electronAPI.file.open();
if (response.success) {
  console.log('File content:', response.data);
}

// Save file
const saveResponse = await window.electronAPI.file.save(content);
```

### Notifications

```typescript
await window.electronAPI.system.showNotification({
  title: 'Hello!',
  body: 'This is a notification',
});
```

## Styling with Tailwind CSS

The project uses Tailwind CSS for styling:

```typescript
// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>

// Interactive states
<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
  Click me
</button>

// Custom components
<div className="card"> {/* Defined in styles/index.css */}
  Card content
</div>
```

## Troubleshooting

### Development Server Won't Start

```bash
# Clear webpack cache
rm -rf .webpack
npm start
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Restart your IDE's TypeScript service
```

### Build Issues

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json .webpack
npm install
```

## Next Steps

1. **Read the Documentation**:
   - [Architecture Documentation](./ARCHITECTURE.md)
   - [Development Guidelines](./DEVELOPMENT.md)

2. **Explore the Code**:
   - Check out the example components
   - Look at the IPC communication patterns
   - Understand the project structure

3. **Build Your App**:
   - Start with small changes
   - Add your own components
   - Implement your app's features

4. **Deploy**:
   - Package for different platforms
   - Set up auto-updates
   - Distribute your app

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Need Help?

- Check the [troubleshooting section](#troubleshooting)
- Review the [development guidelines](./DEVELOPMENT.md)
- Look at the example code in the project
- Create an issue in the repository

---

Happy coding! 🚀 
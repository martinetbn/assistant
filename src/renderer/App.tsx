import React, { useState, useEffect } from "react";

/**
 * Main Application Component
 */
const App: React.FC = () => {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    // Get app version on component mount
    const getVersion = async () => {
      try {
        const response = await window.electronAPI.app.getVersion();
        if (response.success && response.data) {
          setVersion(response.data);
        }
      } catch (error) {
        console.error("Failed to get app version:", error);
      }
    };

    getVersion();
  }, []);

  const handleMinimize = async () => {
    try {
      await window.electronAPI.window.minimize();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  };

  const handleMaximize = async () => {
    try {
      await window.electronAPI.window.maximize();
    } catch (error) {
      console.error("Failed to maximize window:", error);
    }
  };

  const handleClose = async () => {
    try {
      await window.electronAPI.window.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  const handleShowNotification = async () => {
    try {
      await window.electronAPI.system.showNotification({
        title: "Hello from Electron!",
        body: "This is a test notification from your Electron app.",
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Assistant</h1>
          <p className="text-lg text-gray-600 mb-2">
            A modern desktop application to assist with your daily tasks
          </p>
          {version && (
            <p className="text-sm text-gray-500">Version: {version}</p>
          )}
        </header>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Electron
            </h3>
            <p className="text-gray-600 text-sm">
              Cross-platform desktop applications with web technologies
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">⚛️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              React 18
            </h3>
            <p className="text-gray-600 text-sm">
              Modern UI library with hooks and concurrent features
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">🔷</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              TypeScript
            </h3>
            <p className="text-gray-600 text-sm">
              Type-safe development with enhanced IDE support
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tailwind CSS
            </h3>
            <p className="text-gray-600 text-sm">
              Utility-first CSS framework for rapid UI development
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Webpack
            </h3>
            <p className="text-gray-600 text-sm">
              Module bundler with hot reload for development
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-500 text-2xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Electron Forge
            </h3>
            <p className="text-gray-600 text-sm">
              Complete toolchain for packaging and distribution
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Window Controls
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMinimize}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Minimize
            </button>
            <button
              onClick={handleMaximize}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Maximize/Restore
            </button>
            <button
              onClick={handleShowNotification}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Show Notification
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Built with ❤️ using modern web technologies</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

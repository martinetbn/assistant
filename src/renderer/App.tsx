import React, { useState, useEffect } from "react";

/**
 * Main Application Component
 * Transparent Assistant UI for background notifications
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

  const handleShowNotification = async () => {
    try {
      await window.electronAPI.system.showNotification({
        title: "Assistant Notification",
        body: "This is a test notification from your transparent assistant!",
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent">
      {/* Main content area with minimal visible elements */}
      <div className="text-center">
        {/* Main status text */}
        <h1 className="text-white text-2xl font-bold mb-4 drop-shadow-lg">
          Assistant Running
        </h1>
        
        {/* Version info */}
        {version && (
          <p className="text-white text-sm mb-6 drop-shadow-md opacity-80">
            Version: {version}
          </p>
        )}
        
        {/* Test notification button */}
        <button
          onClick={handleShowNotification}
          className="px-6 py-3 bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
        >
          Test Notification
        </button>
      </div>
    </div>
  );
};

export default App;

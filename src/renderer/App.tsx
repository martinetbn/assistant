import React from "react";
import { Notification } from "./components/Notification";

/**
 * Main Application Component
 * Transparent Assistant UI for background notifications
 */
export default function App() {
  return (
    <div className="min-h-screen w-full bg-transparent">
      <Notification />
    </div>
  );
}

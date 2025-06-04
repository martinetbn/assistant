import React from "react";
import { Calendar } from "./components/Calendar";

/**
 * Main Application Component
 * Transparent Assistant UI for background notifications
 */
export default function App() {
  return (
    <div className="min-h-screen w-full flex items-end justify-center flex-col bg-transparent p-4">
      <div className="w-80 max-w-sm">
        <Calendar />
      </div>
    </div>
  );
}

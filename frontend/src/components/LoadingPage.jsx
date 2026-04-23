import React from "react";
import { FiActivity, FiArrowRight } from "react-icons/fi";

function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-6 animate-bounce">
            <FiActivity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-3">
            Campus
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Flow</span>
          </h1>
          <p className="text-gray-600 text-lg font-light">Smart Campus Operations Hub</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative w-16 h-16">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin"></div>

            {/* Middle Rotating Ring (Slower) */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-400 border-l-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>

            {/* Inner Pulsing Circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
          </div>
        </div>

        {/* Status Text with Animation */}
        <div className="mb-8">
          <div className="inline-block">
            <p className="text-gray-700 font-medium text-sm tracking-widest uppercase mb-2 relative">
              <span className="inline-block">Loading</span>
              <span className="inline-flex ml-1">
                <span className="inline-block w-1 h-1 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0s" }}></span>
                <span className="inline-block w-1 h-1 rounded-full bg-indigo-600 animate-bounce ml-1" style={{ animationDelay: "0.2s" }}></span>
                <span className="inline-block w-1 h-1 rounded-full bg-indigo-600 animate-bounce ml-1" style={{ animationDelay: "0.4s" }}></span>
              </span>
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-3">Initializing your workspace</p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 mx-auto mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
              style={{
                width: "100%",
                animation: "shimmer 2s infinite",
              }}
            ></div>
          </div>
        </div>

        {/* Features Loading */}
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm animate-fade-in" style={{ animationDelay: "0s" }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Authenticating</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Fetching Data</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Preparing Interface</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-400 text-xs">
          v1.0.0 • <span className="text-indigo-600 font-semibold">Optimized for Performance</span>
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
          }
          100% {
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default LoadingPage;


import { Building2 } from "lucide-react";

export const NAIPreloader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with animation */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl animate-pulse">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          {/* Rotating ring around logo */}
          <div className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-blue-500 animate-spin"></div>
        </div>

        {/* Company name with typing animation effect */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent animate-fade-in">
            Nurse Assist International
          </h1>
          <p className="text-2xl text-blue-600 font-semibold animate-fade-in animation-delay-500">(NAI)</p>
          <p className="text-lg text-gray-600 animate-fade-in animation-delay-1000">Professional Healthcare Education Management</p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in animation-delay-1500">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-blue-700 rounded-full animate-bounce animation-delay-400"></div>
          </div>
          <p className="text-blue-600 font-medium">Loading your dashboard...</p>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in animation-delay-2000">
          <p className="text-sm text-gray-500">
            Developed by{" "}
            <span className="text-blue-600 font-semibold">Alltechzone</span>
          </p>
        </div>
      </div>
    </div>
  );
};

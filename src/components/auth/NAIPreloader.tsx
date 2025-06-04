
import { Building2 } from "lucide-react";

export const NAIPreloader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Enhanced animated background with particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rotate-45 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-blue-300/30 rounded-full animate-bounce animation-delay-3000"></div>
        <div className="absolute top-1/2 right-32 w-2 h-8 bg-indigo-300/20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/4 w-6 h-6 border border-white/20 rotate-12 animate-spin" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with animation */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm shadow-2xl animate-pulse border border-white/20">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          {/* Rotating ring around logo */}
          <div className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-blue-300 animate-spin"></div>
        </div>

        {/* Company name with typing animation effect */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-fade-in">
            Nurse Assist International
          </h1>
          <p className="text-2xl text-blue-100 font-semibold animate-fade-in animation-delay-500">(NAI)</p>
          <p className="text-lg text-blue-200 animate-fade-in animation-delay-1000">Professional Healthcare Education Management</p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in animation-delay-1500">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-200 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400"></div>
          </div>
          <p className="text-blue-100 font-medium">Loading your dashboard...</p>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in animation-delay-2000">
          <p className="text-sm text-blue-200">
            Developed by{" "}
            <span className="text-white font-semibold">Alltechzone</span>
          </p>
        </div>
      </div>
    </div>
  );
};

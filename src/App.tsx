
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <MobileNavigation />
        <div className="pb-20 pt-2"> {/* Space for bottom nav and top header */}
          <div className="px-3 py-2">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/students" element={<Students />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/students" element={<Students />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);

export default App;

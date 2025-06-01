
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EnhancedLoginForm } from "@/components/auth/EnhancedLoginForm";
import { useAuth } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Students from "./pages/Students";
import ManageStudent from "./pages/ManageStudent";
import PreviewStudent from "./pages/PreviewStudent";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";
import Referrals from "./pages/Referrals";
import RecycleBin from "./pages/RecycleBin";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Marketing from "./pages/Marketing";
import MarketingLeadPreview from "./pages/MarketingLeadPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-lg text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLoginForm />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/manage" element={<ManageStudent />} />
              <Route path="/students/manage/:id" element={<ManageStudent />} />
              <Route path="/students/preview/:id" element={<PreviewStudent />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/payments" element={<Index />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/marketing/preview/:id" element={<MarketingLeadPreview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/recycle-bin" element={<RecycleBin />} />
              <Route path="/audit" element={<AuditLogs />} />
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

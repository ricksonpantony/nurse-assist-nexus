
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Students from "./pages/Students";
import ManageStudent from "./pages/ManageStudent";
import PreviewStudent from "./pages/PreviewStudent";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";
import StudentReports from "./pages/StudentReports";
import PaymentReports from "./pages/PaymentReports";
import Referrals from "./pages/Referrals";
import RecycleBin from "./pages/RecycleBin";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Marketing from "./pages/Marketing";
import MarketingLeadPreview from "./pages/MarketingLeadPreview";
import MarketingManage from "./pages/MarketingManage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full">
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
              <Route path="/marketing/manage" element={<MarketingManage />} />
              <Route path="/marketing/manage/:id" element={<MarketingManage />} />
              <Route path="/marketing/preview/:id" element={<MarketingLeadPreview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/students" element={<StudentReports />} />
              <Route path="/reports/payments" element={<PaymentReports />} />
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
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

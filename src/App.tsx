
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import Index from "@/pages/Index";
import Students from "@/pages/Students";
import StudentAccount from "@/pages/StudentAccount";
import Courses from "@/pages/Courses";
import Marketing from "@/pages/Marketing";
import Referrals from "@/pages/Referrals";
import Reports from "@/pages/Reports";
import AuditLogs from "@/pages/AuditLogs";
import RecycleBin from "@/pages/RecycleBin";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <SidebarInset className="flex-1 flex flex-col overflow-hidden">
                <MobileNavigation />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/student/:studentId" element={<StudentAccount />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/recycle-bin" element={<RecycleBin />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

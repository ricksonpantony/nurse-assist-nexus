
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AuditLog } from '@/components/reports/AuditLog';
import { Shield } from 'lucide-react';

const AuditLogs = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger className="text-blue-600 hover:text-blue-800" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Audit Logs
                </h1>
                <p className="text-gray-600">Monitor system activities and security events</p>
              </div>
            </div>
          </div>

          <AuditLog />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AuditLogs;

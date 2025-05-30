
import { AuditLog } from '@/components/reports/AuditLog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Shield } from 'lucide-react';

const AuditLogs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex items-center gap-4 mb-6 p-6">
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

      <div className="px-6 pb-6">
        <AuditLog />
      </div>
    </div>
  );
};

export default AuditLogs;


import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentReports } from '@/components/reports/StudentReports';
import { PaymentReports } from '@/components/reports/PaymentReports';
import { ReportsDashboard } from '@/components/reports/ReportsDashboard';
import { AuditLog } from '@/components/reports/AuditLog';
import { BarChart3, Users, CreditCard, FileText, Shield } from 'lucide-react';

const Reports = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger className="text-blue-600 hover:text-blue-800" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600">Generate comprehensive reports and insights</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Dashboard Overview */}
            <ReportsDashboard />

            {/* Reports Tabs */}
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detailed Reports
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Generate, filter, and export detailed reports
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="students" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="students" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Student Reports
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Reports
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Audit Log
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="students" className="mt-6">
                    <StudentReports />
                  </TabsContent>
                  
                  <TabsContent value="payments" className="mt-6">
                    <PaymentReports />
                  </TabsContent>

                  <TabsContent value="audit" className="mt-6">
                    <AuditLog />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Reports;

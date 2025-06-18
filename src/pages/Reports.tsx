import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ReportsDashboard } from '@/components/reports/ReportsDashboard';
import { BarChart3, Users, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/AppSidebar";

const Reports = () => {
  const navigate = useNavigate();

  const handleStudentReports = () => {
    navigate('/reports/students');
  };

  const handlePaymentReports = () => {
    navigate('/reports/payments');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center gap-4 mb-6 p-6">
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

            <div className="space-y-6 px-6 pb-6">
              {/* Dashboard Overview */}
              <ReportsDashboard />

              {/* Report Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Reports Button */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Student Reports</CardTitle>
                          <CardDescription className="text-blue-100">
                            Generate detailed student analytics and reports
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-100 mb-4">
                      Access comprehensive student data with advanced filtering options, enrollment statistics, and detailed analytics.
                    </p>
                    <Button 
                      onClick={handleStudentReports}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300"
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Student Reports
                    </Button>
                  </CardContent>
                </Card>

                {/* Payment Reports Button */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Payment Reports</CardTitle>
                          <CardDescription className="text-green-100">
                            Track payments, fees, and financial analytics
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-100 mb-4">
                      Monitor payment breakdowns, fee collection status, and generate financial reports with detailed insights.
                    </p>
                    <Button 
                      onClick={handlePaymentReports}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300"
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Payment Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;

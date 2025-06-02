
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { StudentReports as StudentReportsComponent } from '@/components/reports/StudentReports';
import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentReports = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/reports');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex items-center gap-4 mb-6 p-6">
        <SidebarTrigger className="text-blue-600 hover:text-blue-800" />
        <Button 
          onClick={handleBack}
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Reports
            </h1>
            <p className="text-gray-600">Comprehensive student analytics and detailed reports</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 pb-6">
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <StudentReportsComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentReports;

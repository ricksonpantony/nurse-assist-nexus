
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PaymentReports as PaymentReportsComponent } from '@/components/reports/PaymentReports';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentReports = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/reports');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="flex items-center gap-4 mb-6 p-6">
        <SidebarTrigger className="text-green-600 hover:text-green-800" />
        <Button 
          onClick={handleBack}
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-blue-600 text-white shadow-lg">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Payment Reports
            </h1>
            <p className="text-gray-600">Financial analytics and payment tracking dashboard</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 pb-6">
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <PaymentReportsComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReports;

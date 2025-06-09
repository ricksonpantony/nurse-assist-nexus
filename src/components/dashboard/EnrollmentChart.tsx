
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import type { Student } from "@/hooks/useStudents";

interface EnrollmentChartProps {
  students: Student[];
  loading: boolean;
}

const chartConfig = {
  pass: {
    label: "Pass",
    color: "#22c55e",
  },
  fail: {
    label: "Fail",
    color: "#ef4444",
  },
};

export const EnrollmentChart = ({ students, loading }: EnrollmentChartProps) => {
  // Generate last 6 months data with Pass/Fail comparison
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.join_date);
      return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear();
    });
    
    const passCount = monthStudents.filter(student => student.status === 'Pass').length;
    const failCount = monthStudents.filter(student => student.status === 'Fail').length;
    
    monthlyData.push({
      month: monthName,
      pass: passCount,
      fail: failCount,
    });
  }

  if (loading) {
    return (
      <Card className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-50">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          Pass vs Fail Comparison (Last 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={12} stroke="#64748b" />
              <YAxis fontSize={12} stroke="#64748b" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="pass" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
                name="Pass"
              />
              <Bar 
                dataKey="fail" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Fail"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

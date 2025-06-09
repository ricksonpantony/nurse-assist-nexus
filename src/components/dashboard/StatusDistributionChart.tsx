import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import type { Student } from "@/hooks/useStudents";

interface StatusDistributionChartProps {
  students: Student[];
  loading: boolean;
}

const chartConfig = {
  value: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
};

export const StatusDistributionChart = ({ students, loading }: StatusDistributionChartProps) => {
  const statusData = [
    { name: 'Enrolled', value: students.filter(s => s.status === 'Enrolled').length, color: '#6366f1' },
    { name: 'Attended Online', value: students.filter(s => s.status === 'Attended Online').length, color: '#3b82f6' },
    { name: 'Attend sessions', value: students.filter(s => s.status === 'Attend sessions').length, color: '#10b981' },
    { name: 'Attended F2F', value: students.filter(s => s.status === 'Attended F2F').length, color: '#f59e0b' },
    { name: 'Exam cycle', value: students.filter(s => s.status === 'Exam cycle').length, color: '#ef4444' },
    { name: 'Awaiting results', value: students.filter(s => s.status === 'Awaiting results').length, color: '#8b5cf6' },
    { name: 'Pass', value: students.filter(s => s.status === 'Pass').length, color: '#22c55e' },
    { name: 'Fail', value: students.filter(s => s.status === 'Fail').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <Card className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          Student Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#64748b"
              />
              <YAxis fontSize={12} stroke="#64748b" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        {statusData.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No student status data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

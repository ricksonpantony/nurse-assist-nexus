
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap, TrendingUp, Calendar, Plus, CreditCard, UserPlus, BookPlus, BarChart3, Award, Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { CourseDistributionChart } from "@/components/dashboard/CourseDistributionChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { StudentEngagement } from "@/components/dashboard/StudentEngagement";

const Index = () => {
  const { user } = useAuth();
  const { students, loading: studentsLoading } = useStudents();
  const { courses, loading: coursesLoading } = useCourses();

  const loading = studentsLoading || coursesLoading;

  // Calculate key metrics
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const passedStudents = students.filter(s => s.status === 'Pass').length;
  
  // Current month enrollment
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEnrollments = students.filter(student => {
    const joinDate = new Date(student.join_date);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email || 'Admin'}
            </h1>
            <p className="text-lg text-blue-100 mb-4">
              Educational Management Dashboard
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
                <GraduationCap className="w-4 h-4 mr-1" />
                Administrator
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white px-3 py-1">
                Full Access
              </Badge>
            </div>
          </div>
          <QuickActions />
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats 
        totalStudents={totalStudents}
        totalCourses={totalCourses}
        passedStudents={passedStudents}
        monthlyEnrollments={monthlyEnrollments}
        loading={loading}
      />

      {/* Student Engagement Section */}
      <StudentEngagement students={students} loading={loading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CourseDistributionChart students={students} courses={courses} loading={loading} />
        <StatusDistributionChart students={students} loading={loading} />
      </div>

      {/* Enrollment Trend */}
      <EnrollmentChart students={students} loading={loading} />
    </div>
  );
};

export default Index;

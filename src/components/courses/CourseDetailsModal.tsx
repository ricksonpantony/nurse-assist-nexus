
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  XCircle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  BookOpen,
  Award,
  UserCheck,
  UserX
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    fee: number;
    period_months: number;
  };
}

interface CourseStats {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  activeStudents: number;
  totalRevenue: number;
  passRate: number;
}

export const CourseDetailsModal = ({ isOpen, onClose, course }: CourseDetailsModalProps) => {
  const [stats, setStats] = useState<CourseStats>({
    totalStudents: 0,
    passedStudents: 0,
    failedStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && course.id) {
      fetchCourseStats();
    }
  }, [isOpen, course.id]);

  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all students for this course
      const { data: students, error } = await supabase
        .from('students')
        .select('status, total_course_fee')
        .eq('course_id', course.id);

      if (error) throw error;

      const totalStudents = students?.length || 0;
      const passedStudents = students?.filter(s => s.status === 'Pass').length || 0;
      const failedStudents = students?.filter(s => s.status === 'Fail').length || 0;
      const activeStudents = students?.filter(s => 
        !['Pass', 'Fail'].includes(s.status)
      ).length || 0;
      
      const totalRevenue = students?.reduce((sum, student) => 
        sum + (student.total_course_fee || 0), 0
      ) || 0;
      
      const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;

      setStats({
        totalStudents,
        passedStudents,
        failedStudents,
        activeStudents,
        totalRevenue,
        passRate
      });
    } catch (error) {
      console.error('Error fetching course stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-100";
    if (rate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            Course Details Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900">{course.title}</CardTitle>
                  <CardDescription className="text-blue-700 mt-2">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${course.fee.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.period_months} months
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-blue-600">Loading statistics...</div>
            </div>
          ) : (
            <>
              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
                        <p className="text-sm text-blue-700">Total Students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-900">{stats.passedStudents}</p>
                        <p className="text-sm text-green-700">Passed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <UserX className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-900">{stats.failedStudents}</p>
                        <p className="text-sm text-red-700">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-900">{stats.activeStudents}</p>
                        <p className="text-sm text-purple-700">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-900">
                      <Award className="h-5 w-5" />
                      Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-emerald-700">
                        {stats.passRate.toFixed(1)}%
                      </div>
                      <Badge className={`${getPassRateColor(stats.passRate)} font-semibold`}>
                        {stats.passRate >= 80 ? 'Excellent' : 
                         stats.passRate >= 60 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stats.passRate, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <TrendingUp className="h-5 w-5" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-amber-700">
                      ${stats.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-amber-600 mt-2">
                      Average: ${stats.totalStudents > 0 ? (stats.totalRevenue / stats.totalStudents).toLocaleString() : '0'} per student
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              {stats.totalStudents > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Student Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 font-medium">Passed Students</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(stats.passedStudents / stats.totalStudents) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {((stats.passedStudents / stats.totalStudents) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-red-700 font-medium">Failed Students</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(stats.failedStudents / stats.totalStudents) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {((stats.failedStudents / stats.totalStudents) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">Active Students</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(stats.activeStudents / stats.totalStudents) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {((stats.activeStudents / stats.totalStudents) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

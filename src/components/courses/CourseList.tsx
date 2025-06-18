
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  Star,
  BookOpen
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  fee: number;
  period_months: number;
  created_at?: string;
  updated_at?: string;
}

interface CourseListProps {
  courses: Course[];
  onEdit: (course: any) => void;
  onDelete: (courseId: string) => Promise<void>;
}

export const CourseList = ({ courses, onEdit, onDelete }: CourseListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="bg-gradient-to-br from-white to-slate-50 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Course
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-sm">
                  {course.description || 'No description available'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Course Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{course.period_months} months</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span>${course.fee}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-200 hover:bg-slate-50"
                onClick={() => onEdit(course)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => onDelete(course.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

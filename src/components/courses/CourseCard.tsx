
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  DollarSign,
  Star,
  BookOpen,
  Calendar
} from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    fee: number;
    periodMonths: number;
    category: string;
    level: string;
    students: number;
    rating: number;
    instructor: string;
    status: string;
    features: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Advanced":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2">
            <Badge className={getStatusColor(course.status)}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </Badge>
            <Badge className={getLevelColor(course.level)} variant="outline">
              {course.level}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0 hover:bg-blue-100">
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 hover:bg-red-100">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-blue-600 font-mono mb-2">{course.id}</div>
        
        <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
          {course.title}
        </CardTitle>
        
        <CardDescription className="text-slate-600 text-sm leading-relaxed">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Image/Icon */}
        <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-inner">
          <BookOpen className="h-10 w-10 text-white" />
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">${course.fee}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{course.periodMonths} months</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="h-4 w-4 text-purple-600" />
            <span>{course.students} students</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{course.rating || 'New'}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
            {course.category}
          </Badge>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {course.instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-sm text-slate-700 font-medium">{course.instructor}</span>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Key Features:</h4>
          <div className="flex flex-wrap gap-1">
            {course.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs text-slate-600 border-slate-300">
                {feature}
              </Badge>
            ))}
            {course.features.length > 3 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                +{course.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

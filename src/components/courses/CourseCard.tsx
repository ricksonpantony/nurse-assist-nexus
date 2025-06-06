
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  DollarSign,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { CourseDetailsModal } from "./CourseDetailsModal";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    fee: number;
    period_months: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-xs text-blue-600 font-mono">{course.id}</div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0 hover:bg-blue-100">
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 hover:bg-red-100">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
          
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

          {/* Course Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">${course.fee}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{course.period_months} months</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
            onClick={() => setShowDetailsModal(true)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>

      <CourseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        course={course}
      />
    </>
  );
};

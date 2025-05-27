
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, BookOpen, DollarSign, Clock } from "lucide-react";

interface CreateCourseFormProps {
  course?: any;
  onClose: () => void;
  onSave: (courseData: any) => void;
}

export const CreateCourseForm = ({ course, onClose, onSave }: CreateCourseFormProps) => {
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    fee: course?.fee || "",
    period_months: course?.period_months || ""  // Changed from periodMonths to period_months
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      fee: Number(formData.fee),
      period_months: Number(formData.period_months),  // Changed from periodMonths to period_months
      ...(course && { id: course.id })
    };
    onSave(courseData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {course ? "Edit Course" : "Create New Course"}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {course ? "Update course information" : "Add a new course to your platform"}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Course Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-medium">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter course title (e.g., NCLEX-RN Preparation)"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Course Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide a detailed description of the course objectives and content"
                  className="min-h-[120px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            {/* Course Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Pricing & Duration</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-slate-700 font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Course Fee *
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.fee}
                    onChange={(e) => handleInputChange("fee", e.target.value)}
                    placeholder="2500"
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_months" className="text-slate-700 font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration (Months) *
                  </Label>
                  <Input
                    id="period_months"
                    type="number"
                    value={formData.period_months}
                    onChange={(e) => handleInputChange("period_months", e.target.value)}
                    placeholder="6"
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-blue-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                <Save className="h-4 w-4" />
                {course ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

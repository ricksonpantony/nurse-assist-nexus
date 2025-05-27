
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, BookOpen, DollarSign, Clock, Tag, GraduationCap } from "lucide-react";

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
    periodMonths: course?.periodMonths || "",
    category: course?.category || "",
    level: course?.level || "Beginner",
    instructor: course?.instructor || "",
    features: course?.features?.join(", ") || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      fee: Number(formData.fee),
      periodMonths: Number(formData.periodMonths),
      features: formData.features.split(",").map(f => f.trim()).filter(f => f),
      ...(course && { id: course.id, students: course.students, rating: course.rating, status: course.status })
    };
    onSave(courseData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {course ? "Edit Course" : "Create New Course"}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {course ? "Update course information and settings" : "Add a new course to your educational platform"}
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

        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-slate-700 font-medium">Instructor *</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange("instructor", e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-700 font-medium">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., License Preparation, Clinical Skills"
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
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
              
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="periodMonths" className="text-slate-700 font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration (Months) *
                  </Label>
                  <Input
                    id="periodMonths"
                    type="number"
                    value={formData.periodMonths}
                    onChange={(e) => handleInputChange("periodMonths", e.target.value)}
                    placeholder="6"
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-slate-700 font-medium flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Level *
                  </Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange("level", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Course Features</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="features" className="text-slate-700 font-medium">Key Features</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange("features", e.target.value)}
                  placeholder="Clinical Simulations, Case Studies, Mock Exams, Interactive Learning (separate with commas)"
                  className="min-h-[80px] border-blue-200 focus:border-blue-400"
                />
                <p className="text-xs text-slate-500">Separate features with commas</p>
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

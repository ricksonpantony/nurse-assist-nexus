
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Clock,
  Users,
  BookOpen,
  Star,
  Calendar
} from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";

// Sample course data
const sampleCourses = [
  {
    id: "OBA-2024-001",
    title: "Objective Behavioral Assessment (OBA)",
    description: "Comprehensive behavioral assessment training for nursing professionals focusing on patient interaction and clinical decision-making skills.",
    fee: 1850,
    periodMonths: 6,
    category: "Assessment",
    level: "Intermediate",
    students: 245,
    rating: 4.8,
    instructor: "Dr. Sarah Martinez",
    image: "/placeholder.svg",
    status: "active",
    features: ["Clinical Simulations", "Behavioral Analysis", "Case Studies", "Peer Review"]
  },
  {
    id: "OSCE-2024-002", 
    title: "Objective Structured Clinical Examination (OSCE)",
    description: "Intensive preparation for OSCE examinations with hands-on clinical skills assessment and structured practice sessions.",
    fee: 2200,
    periodMonths: 8,
    category: "Clinical Skills",
    level: "Advanced",
    students: 189,
    rating: 4.9,
    instructor: "Dr. Michael Chen",
    image: "/placeholder.svg",
    status: "active",
    features: ["Clinical Stations", "Skills Assessment", "Mock Exams", "Performance Feedback"]
  },
  {
    id: "NCLEX-2024-003",
    title: "NCLEX-RN Next Generation (NGN)",
    description: "Advanced preparation for the Next Generation NCLEX-RN examination with updated question formats and clinical judgment assessment.",
    fee: 2750,
    periodMonths: 12,
    category: "License Preparation",
    level: "Advanced",
    students: 312,
    rating: 4.7,
    instructor: "Dr. Emily Rodriguez",
    image: "/placeholder.svg",
    status: "active",
    features: ["NGN Questions", "Clinical Judgment", "Case Analysis", "Adaptive Testing"]
  }
];

const Courses = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleCreateCourse = (courseData: any) => {
    const newCourse = {
      ...courseData,
      id: `${courseData.title.substring(0, 3).toUpperCase()}-2024-${String(courses.length + 1).padStart(3, '0')}`,
      students: 0,
      rating: 0,
      status: 'draft'
    };
    setCourses([...courses, newCourse]);
    setShowCreateForm(false);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleUpdateCourse = (updatedCourse: any) => {
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    setShowCreateForm(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
            <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Course Management</h1>
              <p className="text-sm text-blue-600">Create and manage nursing education courses</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Course Statistics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                      <p className="text-3xl font-bold">{courses.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.students, 0)}</p>
                    </div>
                    <Users className="h-8 w-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold">${courses.reduce((sum, course) => sum + (course.fee * course.students), 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Avg Rating</p>
                      <p className="text-3xl font-bold">{(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => handleEditCourse(course)}
                  onDelete={() => handleDeleteCourse(course.id)}
                />
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Course Creation/Edit Form Modal */}
      {showCreateForm && (
        <CreateCourseForm
          course={editingCourse}
          onClose={() => {
            setShowCreateForm(false);
            setEditingCourse(null);
          }}
          onSave={editingCourse ? handleUpdateCourse : handleCreateCourse}
        />
      )}
    </SidebarProvider>
  );
};

export default Courses;

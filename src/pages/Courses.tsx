
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";

// Simplified course data structure
const sampleCourses = [
  {
    id: "OBA-2024-001",
    title: "Objective Behavioral Assessment (OBA)",
    description: "Comprehensive behavioral assessment training for nursing professionals focusing on patient interaction and clinical decision-making skills.",
    fee: 1850,
    periodMonths: 6,
    category: "Assessment"
  },
  {
    id: "OSCE-2024-002", 
    title: "Objective Structured Clinical Examination (OSCE)",
    description: "Intensive preparation for OSCE examinations with hands-on clinical skills assessment and structured practice sessions.",
    fee: 2200,
    periodMonths: 8,
    category: "Clinical Skills"
  },
  {
    id: "NCLEX-2024-003",
    title: "NCLEX-RN Next Generation (NGN)",
    description: "Advanced preparation for the Next Generation NCLEX-RN examination with updated question formats and clinical judgment assessment.",
    fee: 2750,
    periodMonths: 12,
    category: "License Preparation"
  }
];

const Courses = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleCreateCourse = (courseData: any) => {
    const newCourse = {
      ...courseData,
      id: `${courseData.title.substring(0, 3).toUpperCase()}-2024-${String(courses.length + 1).padStart(3, '0')}`
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

          <main className="flex-1 p-6">
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

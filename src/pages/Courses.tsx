
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { useCourses } from "@/hooks/useCourses";

const Courses = () => {
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleCreateCourse = async (courseData: any) => {
    try {
      await addCourse(courseData);
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleUpdateCourse = async (updatedCourse: any) => {
    try {
      await updateCourse(updatedCourse.id, updatedCourse);
      setShowCreateForm(false);
      setEditingCourse(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-blue-600">Loading courses...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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

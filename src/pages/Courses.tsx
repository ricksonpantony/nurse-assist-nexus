import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CourseList } from "@/components/courses/CourseList";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CourseStats } from "@/components/courses/CourseStats";
import { Plus } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Courses = () => {
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleAddCourse = async (courseData: any) => {
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
      const courseId = updatedCourse.id || editingCourse?.id;
      await updateCourse(courseId, updatedCourse);
      setShowCreateForm(false);
      setEditingCourse(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-lg text-blue-600 font-medium">Loading courses...</div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Course Management
                </h1>
                <p className="text-sm text-blue-600/80">Manage courses and view statistics</p>
              </div>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </header>

            <main className="flex-1 p-6 space-y-6">
              {/* Stats Cards */}
              <CourseStats courses={courses} />

              {/* Course List */}
              <CourseList
                courses={courses}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            </main>

            {/* Create/Edit Course Form Modal */}
            {showCreateForm && (
              <CreateCourseForm
                course={editingCourse}
                onClose={() => {
                  setShowCreateForm(false);
                  setEditingCourse(null);
                }}
                onSave={editingCourse ? handleUpdateCourse : handleAddCourse}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Courses;

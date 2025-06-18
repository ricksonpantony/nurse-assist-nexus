
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseList } from "@/components/courses/CourseList";
import { CourseStats } from "@/components/courses/CourseStats";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CourseDetailsModal } from "@/components/courses/CourseDetailsModal";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Courses = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const { toast } = useToast();

  const handleCreateCourse = async (courseData: any) => {
    try {
      await addCourse(courseData);
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const handleUpdateCourse = async (courseData: any) => {
    try {
      await updateCourse(selectedCourse?.id, courseData);
      setShowDetailsModal(false);
      setSelectedCourse(null);
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      try {
        await deleteCourse(courseToDelete);
        setShowDeleteDialog(false);
        setCourseToDelete(null);
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
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
            <CourseStats />
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Course
                </Button>
              </div>

              <CourseList 
                courses={courses}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />

              {showCreateForm && (
                <CreateCourseForm
                  onClose={() => setShowCreateForm(false)}
                  onSubmit={handleCreateCourse}
                />
              )}

              {showDetailsModal && selectedCourse && (
                <CourseDetailsModal
                  course={selectedCourse}
                  onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedCourse(null);
                  }}
                  onUpdate={handleUpdateCourse}
                />
              )}

              {showDeleteDialog && (
                <DeleteCourseDialog
                  isOpen={showDeleteDialog}
                  onClose={() => {
                    setShowDeleteDialog(false);
                    setCourseToDelete(null);
                  }}
                  onConfirm={confirmDeleteCourse}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Courses;

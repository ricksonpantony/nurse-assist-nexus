import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";
import { useCourses } from "@/hooks/useCourses";
import { useIsMobile } from "@/hooks/use-mobile";

const Courses = () => {
  const { courses, loading, addCourse, updateCourse, deleteCourse, checkCourseAssignments } = useCourses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    courseId: "",
    courseName: "",
    canDelete: true,
    studentCount: 0
  });
  const isMobile = useIsMobile();

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

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    try {
      // Check if course can be deleted
      const { canDelete, studentCount } = await checkCourseAssignments(courseId);
      
      setDeleteDialog({
        open: true,
        courseId,
        courseName,
        canDelete,
        studentCount
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      await deleteCourse(deleteDialog.courseId);
      setDeleteDialog({
        open: false,
        courseId: "",
        courseName: "",
        canDelete: true,
        studentCount: 0
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    if (isMobile) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading courses...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  const courseContent = (
    <>
      <div className={`${isMobile ? 'mb-4' : 'mb-6'} ${isMobile ? 'bg-gradient-to-r from-blue-600 to-blue-700 -mx-3 -mt-2 p-4 text-white' : 'bg-gradient-to-r from-white via-blue-50 to-white p-6 rounded-lg shadow-lg'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <h1 className={`${isMobile ? 'text-xl text-white' : 'text-xl text-blue-900'} font-bold`}>
              Course Management
            </h1>
            <p className={`${isMobile ? 'text-blue-100' : 'text-blue-600'} text-sm`}>
              Create and manage nursing education courses
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className={`gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg ${isMobile ? 'w-full bg-white text-blue-600 hover:bg-gray-100' : ''}`}
            variant={isMobile ? "secondary" : "default"}
          >
            <Plus className="h-4 w-4" />
            Create New Course
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => handleDeleteCourse(course.id, course.title)}
          />
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {courseContent}
        
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

        <DeleteCourseDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          courseName={deleteDialog.courseName}
          canDelete={deleteDialog.canDelete}
          studentCount={deleteDialog.studentCount}
          onConfirm={confirmDeleteCourse}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => handleEditCourse(course)}
              onDelete={() => handleDeleteCourse(course.id, course.title)}
            />
          ))}
        </div>
      </main>

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

      <DeleteCourseDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        courseName={deleteDialog.courseName}
        canDelete={deleteDialog.canDelete}
        studentCount={deleteDialog.studentCount}
        onConfirm={confirmDeleteCourse}
      />
    </div>
  );
};

export default Courses;

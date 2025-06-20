
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRecycleBin } from "@/hooks/useRecycleBin";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  fee: number;
  period_months: number;
  created_at?: string;
  updated_at?: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { moveToRecycleBin } = useRecycleBin();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCourseId = `COURSE-${new Date().getFullYear()}-${String(courses.length + 1).padStart(3, '0')}`;
      
      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...courseData, id: newCourseId }])
        .select()
        .single();

      if (error) throw error;
      
      setCourses(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ ...courseData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (courseData.fee !== undefined) {
        console.log(`Updating student fees for course ${id} to $${courseData.fee}`);
        
        const { error: updateStudentsError } = await supabase
          .from('students')
          .update({ 
            total_course_fee: courseData.fee,
            updated_at: new Date().toISOString()
          })
          .eq('course_id', id);

        if (updateStudentsError) {
          console.error('Error updating student fees:', updateStudentsError);
          toast({
            title: "Warning",
            description: "Course updated but failed to sync student fees",
            variant: "destructive",
          });
        } else {
          console.log('Successfully updated student fees');
        }
      }
      
      setCourses(prev => prev.map(course => course.id === id ? data : course));
      toast({
        title: "Success",
        description: courseData.fee !== undefined 
          ? "Course updated and student fees synchronized" 
          : "Course updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkCourseAssignments = async (courseId: string): Promise<{ canDelete: boolean; studentCount: number }> => {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      if (error) throw error;

      return {
        canDelete: (count || 0) === 0,
        studentCount: count || 0
      };
    } catch (error) {
      console.error('Error checking course assignments:', error);
      return { canDelete: false, studentCount: 0 };
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      // Check if course is assigned to students
      const { canDelete, studentCount } = await checkCourseAssignments(id);
      
      if (!canDelete) {
        toast({
          title: "Cannot Delete Course",
          description: `This course is currently assigned to ${studentCount} student(s). Please update the student details before deleting.`,
          variant: "destructive",
        });
        return false;
      }

      // Get the course data before deleting
      const courseToDelete = courses.find(course => course.id === id);
      if (!courseToDelete) {
        throw new Error('Course not found');
      }

      // Try to move to recycle bin, but continue with deletion even if it fails
      try {
        await moveToRecycleBin('courses', id, courseToDelete);
      } catch (recycleBinError) {
        console.warn('Failed to move to recycle bin, proceeding with direct deletion:', recycleBinError);
      }

      // Delete from original table
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCourses(prev => prev.filter(course => course.id !== id));
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    checkCourseAssignments,
    refetch: fetchCourses
  };
};

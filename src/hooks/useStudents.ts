
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  country: string | null;
  passport_id: string | null;
  course_id: string | null;
  batch_id: string | null;
  referral_id: string | null;
  join_date: string;
  class_start_date: string | null;
  status: 'Attended Online' | 'Attend sessions' | 'Attended F2F' | 'Exam cycle' | 'Awaiting results' | 'Pass' | 'Fail';
  total_course_fee: number;
  advance_payment: number;
  installments: number;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  payment_date: string;
  stage: string;
  amount: number;
  payment_mode: string;
  created_at?: string;
}

const isValidStatus = (status: string): status is Student['status'] => {
  return ['Attended Online', 'Attend sessions', 'Attended F2F', 'Exam cycle', 'Awaiting results', 'Pass', 'Fail'].includes(status);
};

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure proper typing
      const transformedData: Student[] = (data || []).map(item => ({
        ...item,
        status: isValidStatus(item.status) ? item.status : 'Pass'
      }));
      
      setStudents(transformedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStudentId = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    return `ATZ-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newStudentId = await generateStudentId();
      
      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, id: newStudentId }])
        .select()
        .single();

      if (error) throw error;

      // Add advance payment if provided
      if (studentData.advance_payment > 0) {
        await supabase
          .from('payments')
          .insert([{
            student_id: newStudentId,
            payment_date: new Date().toISOString().split('T')[0],
            stage: 'Advance',
            amount: studentData.advance_payment,
            payment_mode: 'Credit Card'
          }]);
      }
      
      // Transform the returned data
      const transformedData: Student = {
        ...data,
        status: isValidStatus(data.status) ? data.status : 'Pass'
      };
      
      setStudents(prev => [transformedData, ...prev]);
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      return transformedData;
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      console.log('Updating student with ID:', id);
      console.log('Update data:', studentData);
      
      // Remove undefined values and prepare clean update object
      const cleanData = Object.entries(studentData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      // Add updated_at timestamp
      cleanData.updated_at = new Date().toISOString();
      
      console.log('Clean update data:', cleanData);
      
      const { data, error } = await supabase
        .from('students')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Update successful, returned data:', data);
      
      // Transform the returned data
      const transformedData: Student = {
        ...data,
        status: isValidStatus(data.status) ? data.status : 'Pass'
      };
      
      setStudents(prev => prev.map(student => student.id === id ? transformedData : student));
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      return transformedData;
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchStudentPayments = async (studentId: string): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching student payments:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    fetchStudentPayments,
    refetch: fetchStudents
  };
};

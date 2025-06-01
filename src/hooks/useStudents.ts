import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRecycleBin } from "@/hooks/useRecycleBin";

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  passport_id: string | null;
  address: string | null;
  country: string | null;
  course_id: string | null;
  status: "Attended Online" | "Attend sessions" | "Attended F2F" | "Exam cycle" | "Awaiting results" | "Pass" | "Fail";
  total_course_fee: number;
  advance_payment: number;
  installments: number;
  join_date: string | null;
  class_start_date: string | null;
  batch_id: string | null;
  referral_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  stage: string;
  payment_mode: string;
  created_at?: string;
}

// Type for inserting new students (without auto-generated fields)
type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { moveToRecycleBin } = useRecycleBin();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        setStudents([]);
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: StudentInsert & { referral_payment_amount?: number }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { referral_payment_amount, ...cleanStudentData } = studentData;

      const { data, error } = await supabase
        .from('students')
        .insert(cleanStudentData)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student> & { referral_payment_amount?: number }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { referral_payment_amount, ...cleanStudentData } = studentData;

      const cleanData = Object.entries(cleanStudentData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      cleanData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('students')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(student => student.id === id ? data : student));
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the student data before deleting
      const studentToDelete = students.find(student => student.id === id);
      if (!studentToDelete) {
        throw new Error('Student not found');
      }

      // Move to recycle bin first
      await moveToRecycleBin('students', id, studentToDelete);

      // Then delete from original table
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Success",
        description: "Student moved to recycle bin",
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchStudentPayments = async (studentId: string): Promise<Payment[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        return [];
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching student payments:', error);
      return [];
    }
  };

  const addStudentPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment added successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive",
      });
      throw error;
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
    addStudentPayment,
    refetch: fetchStudents
  };
};

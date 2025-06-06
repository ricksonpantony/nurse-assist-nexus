import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRecycleBin } from "@/hooks/useRecycleBin";

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
  advance_payment_method: string | null;
  installments: number;
  notes: string | null;
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
  const { moveToRecycleBin } = useRecycleBin();

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
        status: isValidStatus(item.status) ? item.status : 'Pass',
        advance_payment_method: item.advance_payment_method || null,
        notes: item.notes || null
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

  const backfillDirectReferralStatus = async () => {
    try {
      // Update all students with null referral_id to have "Direct" as referral status
      // Since we can't store "Direct" as referral_id, we'll leave it as null
      // The UI will interpret null referral_id as "Direct"
      console.log('Backfill not needed - null referral_id represents Direct status');
    } catch (error) {
      console.error('Error during backfill:', error);
    }
  };

  const generateStudentId = async () => {
    const year = new Date().getFullYear();
    
    try {
      // Get all existing student IDs that match the current year pattern
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .like('id', `ATZ-${year}-%`);

      if (error) throw error;

      // Extract the numeric parts and find the highest number
      let maxNumber = 0;
      if (data && data.length > 0) {
        data.forEach(student => {
          const match = student.id.match(/ATZ-\d{4}-(\d{3})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        });
      }

      // Generate the next ID
      const nextNumber = maxNumber + 1;
      return `ATZ-${year}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating student ID:', error);
      // Fallback to timestamp-based ID if there's an error
      const timestamp = Date.now().toString().slice(-3);
      return `ATZ-${year}-${timestamp}`;
    }
  };

  const cleanStudentData = (studentData: any) => {
    // Clean the data to ensure proper null handling for UUID fields
    const cleanData = { ...studentData };
    
    // Convert empty strings to null for UUID fields
    if (cleanData.course_id === '' || cleanData.course_id === 'none') {
      cleanData.course_id = null;
    }
    if (cleanData.referral_id === '' || cleanData.referral_id === 'direct') {
      cleanData.referral_id = null;
    }
    if (cleanData.batch_id === '') {
      cleanData.batch_id = null;
    }
    if (cleanData.passport_id === '') {
      cleanData.passport_id = null;
    }
    if (cleanData.address === '') {
      cleanData.address = null;
    }
    if (cleanData.country === '') {
      cleanData.country = null;
    }
    if (cleanData.class_start_date === '') {
      cleanData.class_start_date = null;
    }
    if (cleanData.advance_payment_method === '') {
      cleanData.advance_payment_method = null;
    }
    if (cleanData.notes === '') {
      cleanData.notes = null;
    }

    return cleanData;
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'> & { referral_payment_amount?: number }) => {
    try {
      const newStudentId = await generateStudentId();
      
      console.log('Generated student ID:', newStudentId);
      console.log('Student data to insert:', studentData);
      
      // Extract referral payment amount before saving student
      const referralPaymentAmount = studentData.referral_payment_amount || 0;
      const { referral_payment_amount, ...cleanStudentDataWithoutReferral } = studentData;
      
      // Clean the data to handle null values properly
      const insertData = cleanStudentData({
        ...cleanStudentDataWithoutReferral,
        id: newStudentId,
        // Ensure numeric fields are properly typed
        total_course_fee: Number(cleanStudentDataWithoutReferral.total_course_fee) || 0,
        advance_payment: Number(cleanStudentDataWithoutReferral.advance_payment) || 0,
        installments: 1, // Always set to 1
      });
      
      console.log('Clean insert data:', insertData);
      
      const { data, error } = await supabase
        .from('students')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Student inserted successfully:', data);

      // Add advance payment if provided
      if (studentData.advance_payment > 0) {
        await supabase
          .from('payments')
          .insert([{
            student_id: newStudentId,
            payment_date: new Date().toISOString().split('T')[0],
            stage: 'Advance',
            amount: studentData.advance_payment,
            payment_mode: studentData.advance_payment_method || 'Bank Transfer'
          }]);
      }

      // Add referral payment if provided and referral exists
      if (referralPaymentAmount > 0 && insertData.referral_id) {
        await supabase
          .from('referral_payments')
          .insert([{
            referral_id: insertData.referral_id,
            student_id: newStudentId,
            amount: referralPaymentAmount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Bank Transfer',
            notes: `Payment for referring student ${data.full_name}`
          }]);
      }
      
      // Transform the returned data
      const transformedData: Student = {
        ...data,
        status: isValidStatus(data.status) ? data.status : 'Pass',
        advance_payment_method: data.advance_payment_method || null,
        notes: data.notes || null
      };
      
      setStudents(prev => [transformedData, ...prev]);
      toast({
        title: "Success",
        description: `Student added successfully with ID: ${newStudentId}`,
      });
      return transformedData;
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: `Failed to add student: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student> & { referral_payment_amount?: number }) => {
    try {
      console.log('Updating student with ID:', id);
      console.log('Update data:', studentData);
      
      // Extract referral payment amount before updating student
      const referralPaymentAmount = studentData.referral_payment_amount || 0;
      const { referral_payment_amount, ...studentDataWithoutReferralPayment } = studentData;
      
      // Clean the data to handle null values properly
      const cleanData = cleanStudentData({
        ...studentDataWithoutReferralPayment,
        updated_at: new Date().toISOString(),
        installments: 1, // Always set to 1
      });
      
      // Remove undefined values
      const finalData = Object.entries(cleanData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      console.log('Clean update data:', finalData);
      
      const { data, error } = await supabase
        .from('students')
        .update(finalData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Add referral payment if provided and referral exists
      if (referralPaymentAmount > 0 && finalData.referral_id) {
        await supabase
          .from('referral_payments')
          .insert([{
            referral_id: finalData.referral_id,
            student_id: id,
            amount: referralPaymentAmount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Bank Transfer',
            notes: `Payment for referring student ${data.full_name}`
          }]);
      }
      
      console.log('Update successful, returned data:', data);
      
      // Transform the returned data
      const transformedData: Student = {
        ...data,
        status: isValidStatus(data.status) ? data.status : 'Pass',
        advance_payment_method: data.advance_payment_method || null,
        notes: data.notes || null
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
      console.log('Deleting student with ID:', id);
      
      // First, get the student data before deletion
      const { data: studentData, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching student for deletion:', fetchError);
        throw fetchError;
      }

      console.log('Student data to move to recycle bin:', studentData);

      // Move to recycle bin first
      await moveToRecycleBin('students', id, studentData);

      // Then delete from the original table
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting student from database:', deleteError);
        throw deleteError;
      }
      
      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Success",
        description: "Student moved to recycle bin successfully",
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
    // Run backfill once on component mount
    backfillDirectReferralStatus();
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

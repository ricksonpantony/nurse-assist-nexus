
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useStudentPaymentDetails = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPaymentDetails = async (studentId: string) => {
    if (!studentId) {
      console.error('Student ID is required');
      return [];
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching payment details",
        description: error.message || "Failed to load payment details",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addPaymentRecord = async (paymentData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding payment",
        description: error.message || "Failed to add payment record",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentRecord = async (paymentId: string, paymentData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating payment",
        description: error.message || "Failed to update payment record",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentRecord = async (paymentId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting payment",
        description: error.message || "Failed to delete payment record",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchPaymentDetails,
    addPaymentRecord,
    updatePaymentRecord,
    deletePaymentRecord
  };
};

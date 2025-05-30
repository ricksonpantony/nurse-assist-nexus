
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/hooks/useStudents";

export const useStudentPaymentDetails = (studentId?: string) => {
  const [paymentData, setPaymentData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: true });

      if (error) throw error;
      setPaymentData(data || []);
    } catch (error) {
      console.error('Error fetching student payments:', error);
      setPaymentData([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const totalPaid = paymentData.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate remaining amount - this would need student data to be accurate
  // For now, returning 0 as we don't have access to total course fee here
  const remainingAmount = 0;

  return {
    paymentData,
    totalPaid,
    remainingAmount,
    isLoading,
    fetchPayments
  };
};

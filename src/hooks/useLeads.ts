
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  lead_id?: string;
  full_name: string;
  email: string;
  phone: string;
  passport_id?: string;
  address?: string;
  country?: string;
  referral_id?: string;
  interested_course_id?: string;
  expected_joining_date?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateLeadId = async () => {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    return `LEAD-${String(nextNumber).padStart(4, '0')}`;
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'lead_id'>) => {
    try {
      const leadId = await generateLeadId();
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...leadData, lead_id: leadId }])
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Lead added successfully',
      });
      return data;
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to add lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ ...leadData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });
      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    addLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
  };
};

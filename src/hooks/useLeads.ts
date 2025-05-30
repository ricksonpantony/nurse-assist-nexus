
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
    try {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      const nextNumber = (count || 0) + 1;
      return `LEAD-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating lead ID:', error);
      // Fallback to timestamp-based ID
      return `LEAD-${Date.now().toString().slice(-4)}`;
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched leads:', data);
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'lead_id'>) => {
    try {
      console.log('Adding lead with data:', leadData);
      
      const leadId = await generateLeadId();
      console.log('Generated lead ID:', leadId);
      
      const insertData = {
        ...leadData,
        lead_id: leadId,
        status: 'active',
        // Ensure all required fields are present
        full_name: leadData.full_name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        // Handle optional fields properly
        passport_id: leadData.passport_id || null,
        address: leadData.address || null,
        country: leadData.country || null,
        referral_id: leadData.referral_id || null,
        interested_course_id: leadData.interested_course_id || null,
        expected_joining_date: leadData.expected_joining_date || null,
        notes: leadData.notes || null,
      };

      console.log('Inserting lead data:', insertData);

      const { data, error } = await supabase
        .from('leads')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Successfully added lead:', data);
      setLeads(prev => [data, ...prev]);
      
      toast({
        title: 'Success',
        description: `Lead ${leadId} added successfully`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: 'Error',
        description: `Failed to add lead: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    try {
      console.log('Updating lead:', id, leadData);
      
      const { data, error } = await supabase
        .from('leads')
        .update({ ...leadData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

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
        description: `Failed to update lead: ${error.message || 'Unknown error'}`,
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

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: `Failed to delete lead: ${error.message || 'Unknown error'}`,
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

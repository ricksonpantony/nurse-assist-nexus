
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  severity: string;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuditLogs = async (filters?: {
    table_name?: string;
    action?: string;
    severity?: string;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      query = query.limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    logs,
    loading,
    fetchAuditLogs,
    refetch: () => fetchAuditLogs()
  };
};

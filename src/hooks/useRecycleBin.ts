
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecycleBinItem {
  id: string;
  original_table: string;
  original_id: string;
  record_data: any;
  deleted_at: string;
  deleted_by: string | null;
  restored_at?: string | null;
  permanently_deleted_at?: string | null;
}

export const useRecycleBin = () => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecycleBinItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recycle_bin')
        .select('*')
        .is('restored_at', null)
        .is('permanently_deleted_at', null)
        .order('deleted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching recycle bin items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recycle bin items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const moveToRecycleBin = async (tableName: string, recordId: string, recordData: any) => {
    try {
      const { error } = await supabase
        .from('recycle_bin')
        .insert({
          original_table: tableName,
          original_id: recordId,
          record_data: recordData,
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      await fetchRecycleBinItems();
      return true;
    } catch (error) {
      console.error('Error moving to recycle bin:', error);
      throw error;
    }
  };

  const restoreItem = async (item: RecycleBinItem) => {
    try {
      // Use dynamic SQL through RPC function or direct insert with proper typing
      const tableName = item.original_table as keyof typeof supabase['from'];
      
      // For type safety, we'll handle each table case explicitly
      let restoreError;
      
      switch (item.original_table) {
        case 'students':
          const { error: studentsError } = await supabase
            .from('students')
            .insert(item.record_data);
          restoreError = studentsError;
          break;
        case 'courses':
          const { error: coursesError } = await supabase
            .from('courses')
            .insert(item.record_data);
          restoreError = coursesError;
          break;
        case 'referrals':
          const { error: referralsError } = await supabase
            .from('referrals')
            .insert(item.record_data);
          restoreError = referralsError;
          break;
        case 'payments':
          const { error: paymentsError } = await supabase
            .from('payments')
            .insert(item.record_data);
          restoreError = paymentsError;
          break;
        case 'leads':
          const { error: leadsError } = await supabase
            .from('leads')
            .insert(item.record_data);
          restoreError = leadsError;
          break;
        default:
          throw new Error(`Unsupported table for restoration: ${item.original_table}`);
      }

      if (restoreError) throw restoreError;

      // Mark as restored in recycle bin
      const { error: updateError } = await supabase
        .from('recycle_bin')
        .update({ restored_at: new Date().toISOString() })
        .eq('id', item.id);

      if (updateError) throw updateError;

      await fetchRecycleBinItems();
      toast({
        title: 'Success',
        description: 'Item restored successfully',
      });
    } catch (error) {
      console.error('Error restoring item:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore item',
        variant: 'destructive',
      });
    }
  };

  const permanentlyDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('recycle_bin')
        .update({ permanently_deleted_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;

      await fetchRecycleBinItems();
      toast({
        title: 'Success',
        description: 'Item permanently deleted',
      });
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to permanently delete item',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRecycleBinItems();
  }, []);

  return {
    items,
    loading,
    moveToRecycleBin,
    restoreItem,
    permanentlyDelete,
    refetch: fetchRecycleBinItems
  };
};

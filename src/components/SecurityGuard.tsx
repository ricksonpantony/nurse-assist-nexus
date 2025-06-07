
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface SecurityGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
}

export const SecurityGuard = ({ 
  children, 
  requiredRole = ['admin', 'owner'], 
  fallback 
}: SecurityGuardProps) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (!user || !userRole || !requiredRole.includes(userRole)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to access this section.</p>
      </div>
    );
  }

  return <>{children}</>;
};

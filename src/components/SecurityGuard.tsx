
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
  requiredRole = ['admin', 'owner', 'user'], 
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
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role if there's an error
        } else {
          setUserRole(profile?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (!user) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500">You need to be logged in to access this section.</p>
      </div>
    );
  }

  // Check if user's role is in the required roles
  if (userRole && !requiredRole.includes(userRole)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to access this section.</p>
        <p className="text-sm text-gray-400 mt-2">Required role: {requiredRole.join(', ')}</p>
        <p className="text-sm text-gray-400">Your role: {userRole}</p>
      </div>
    );
  }

  return <>{children}</>;
};

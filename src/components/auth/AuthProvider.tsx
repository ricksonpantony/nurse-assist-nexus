
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "./LoginForm";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle user profile creation/update for admin access
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            try {
              // Split full name into first and last name parts
              const fullName = session.user.user_metadata?.full_name || session.user.email || 'Admin User';
              const nameParts = fullName.split(' ');
              const firstName = nameParts[0] || 'Admin';
              const lastName = nameParts.slice(1).join(' ') || 'User';

              // Try to upsert user profile with admin role using direct database operations
              const { error } = await supabase
                .from('user_profiles')
                .upsert({
                  id: session.user.id,
                  // full_name: fullName,
                  // first_name: firstName,
                  // last_name: lastName,
                  role: 'admin'
                }, {
                  onConflict: 'id'
                });

              if (error) {
                console.error('Error handling user profile:', error);
                // Don't throw error - just log it and continue
              } else {
                console.log('User profile handled successfully');
              }
            } catch (error) {
              console.error('Error in user profile handling:', error);
              // Don't throw error - just log it and continue
            }
          }, 100);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    logout,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "./LoginForm";
import { NAIPreloader } from "./NAIPreloader";

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
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle user profile creation for new sign-ins only
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            try {
              // Check if profile already exists to avoid unnecessary updates
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id, role')
                .eq('id', session.user.id)
                .single();

              // Create profile with 'admin' role for all users
              if (!existingProfile) {
                const fullName = session.user.user_metadata?.full_name || session.user.email || 'User';
                
                const { error } = await supabase
                  .from('user_profiles')
                  .insert({
                    id: session.user.id,
                    full_name: fullName,
                    role: 'admin' // Changed to 'admin' for all users
                  });

                if (error) {
                  console.error('Error creating user profile:', error.message);
                }
              } else if (existingProfile.role !== 'admin') {
                // Update existing users to admin role
                const { error } = await supabase
                  .from('user_profiles')
                  .update({ role: 'admin' })
                  .eq('id', session.user.id);

                if (error) {
                  console.error('Error updating user role to admin:', error.message);
                }
              }
            } catch (error) {
              console.error('Error in user profile handling:', error);
            }
          }, 100);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    return <NAIPreloader />;
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

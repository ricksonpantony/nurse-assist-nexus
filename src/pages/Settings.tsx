
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { PasswordUpdate } from "@/components/settings/PasswordUpdate";
import { Building2, Users, Lock } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex items-center gap-4 mb-6 p-6">
        <SidebarTrigger className="text-blue-600 hover:text-blue-800" />
        <div className="flex-1">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-blue-100">
              Welcome back, {userProfile?.full_name || user?.email}! 
              {userProfile?.role === 'admin' && (
                <span className="ml-2 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                  Admin
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
          {/* Company Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CompanySettings userRole={userProfile?.role} />
            </CardContent>
          </Card>

          {/* Password Update */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Update Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PasswordUpdate />
            </CardContent>
          </Card>

          {/* User Management - Only for Admins */}
          {userProfile?.role === 'admin' && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm xl:col-span-2">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <UserManagement />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

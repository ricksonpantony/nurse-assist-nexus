
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordUpdate } from "@/components/settings/PasswordUpdate";
import { UserManagement } from "@/components/settings/UserManagement";
import { Lock, Users, Settings as SettingsIcon } from "lucide-react";

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
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
              <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                  <SettingsIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Settings</h1>
                  <p className="text-sm text-blue-600">Manage your account and preferences</p>
                </div>
              </div>
              {userProfile?.role === 'admin' && (
                <div className="ml-auto">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Administrator
                  </span>
                </div>
              )}
            </header>

            <main className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="security" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm border border-blue-100 shadow-lg">
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Security
                    </TabsTrigger>
                    {userProfile?.role === 'admin' && (
                      <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Admin Management
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="security" className="space-y-6">
                      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Password & Security
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <PasswordUpdate />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {userProfile?.role === 'admin' && (
                      <TabsContent value="users" className="space-y-6">
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Admin User Management
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <UserManagement />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;

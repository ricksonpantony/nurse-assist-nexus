
import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  Home,
  Building2,
  UserCheck,
  Target,
  Trash2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Target,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Referrals",
    url: "/referrals",
    icon: UserCheck,
  },
  {
    title: "Recycle Bin",
    url: "/recycle-bin",
    icon: Trash2,
  },
  {
    title: "Audit Logs",
    url: "/audit",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getDisplayName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return (userProfile?.first_name || '') + " " + (userProfile?.last_name || '');
    }
    return userProfile?.full_name || '';
  };

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      <SidebarHeader className="border-b border-blue-700/30 p-6 bg-gradient-to-r from-blue-800 to-blue-700">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-white to-blue-50 shadow-lg p-2">
            <img 
              src="/lovable-uploads/abd1d232-3384-4cf5-8d05-3b3c8c7153f7.png" 
              alt="Nurse Assist International Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NAI</h1>
            <p className="text-sm text-blue-200">Nurse Assist International</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 bg-gradient-to-b from-blue-800 to-blue-900">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start gap-3 rounded-xl px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-105 transition-all duration-200 backdrop-blur-sm ${
                      location.pathname === item.url 
                        ? 'bg-gradient-to-r from-white/20 to-white/10 text-white font-semibold shadow-lg' 
                        : ''
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-blue-700/30 p-4 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-100 text-blue-600 text-sm font-bold shadow-lg">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              <p className="text-xs text-green-300 font-semibold">
                {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Admin'}
              </p>
            </div>
          </div>
          
          <LogoutButton />
          
          {/* Footer Credits */}
          <div className="text-center pt-2 border-t border-blue-700/30">
            <p className="text-xs text-blue-300">
              Developed by{" "}
              <a 
                href="https://www.alltechzone.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-white hover:underline transition-colors"
              >
                Alltechzone
              </a>
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

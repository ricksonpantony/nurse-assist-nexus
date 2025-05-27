
import {
  Calendar,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  Home,
  Building2
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
import { useLocation } from "react-router-dom";

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
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
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

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      <SidebarHeader className="border-b border-blue-700/30 p-6 bg-gradient-to-r from-blue-800 to-blue-700">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white to-blue-50 shadow-lg">
            <Building2 className="h-7 w-7 text-blue-600" />
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
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-blue-700/30 p-4 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm hover:bg-white/15 transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-100 text-blue-600 text-sm font-bold shadow-lg">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-blue-200 truncate">admin@nai.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

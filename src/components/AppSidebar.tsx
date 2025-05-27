
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
  return (
    <Sidebar className="border-r border-blue-100">
      <SidebarHeader className="border-b border-blue-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-900">NAI</h1>
            <p className="text-sm text-blue-600">Nurse Assist International</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-blue-700 hover:bg-blue-50 hover:text-blue-800 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-900 data-[active=true]:font-medium"
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
      
      <SidebarFooter className="border-t border-blue-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 truncate">Admin User</p>
            <p className="text-xs text-blue-600 truncate">admin@nai.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

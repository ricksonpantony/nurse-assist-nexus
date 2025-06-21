
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  Target,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  Building2,
  UserCheck,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogoutButton } from "@/components/auth/LogoutButton";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Students", url: "/students", icon: Users },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Marketing", url: "/marketing", icon: Target },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Referrals", url: "/referrals", icon: UserCheck },
  { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
  { title: "Audit Logs", url: "/audit", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const currentPage = menuItems.find(item => item.url === location.pathname);

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 flex h-14 items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 shadow-lg md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-10 flex items-center justify-center">
            <img 
              src="/uploads/abd1d232-3384-4cf5-8d05-3b3c8c7153f7.png" 
              alt="Nurse Assist International Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold text-white">NAI</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {currentPage?.title || "Dashboard"}
          </span>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-b from-blue-900 to-blue-800 border-l-0">
              <SheetHeader className="border-b border-blue-700/30 pb-4">
                <SheetTitle className="flex items-center gap-3 text-white">
                  <div className="h-8 w-10 flex items-center justify-center">
                    <img 
                      src="/uploads/abd1d232-3384-4cf5-8d05-3b3c8c7153f7.png" 
                      alt="Nurse Assist International Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-bold">NAI</div>
                    <div className="text-xs text-blue-200">Nurse Assist International</div>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-white/90 transition-all hover:bg-white/10 hover:text-white ${
                      location.pathname === item.url 
                        ? 'bg-white/20 text-white font-semibold' 
                        : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
              
              {/* User Info & Logout */}
              <div className="absolute bottom-4 left-4 right-4 space-y-3">
                <div className="rounded-lg bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 text-sm font-bold">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.user_metadata?.full_name || 'Admin User'}
                      </p>
                      <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom Navigation for very small screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                location.pathname === item.url
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

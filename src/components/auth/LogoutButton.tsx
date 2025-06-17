
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { useState } from "react";

export const LogoutButton = () => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      console.log('Logout button clicked');
      
      toast.success("Logging out...");
      await logout();
    } catch (error) {
      console.error('Logout button error:', error);
      toast.error("Logout completed");
      // Force reload even on error to ensure clean state
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      disabled={isLoggingOut}
      className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
    </Button>
  );
};

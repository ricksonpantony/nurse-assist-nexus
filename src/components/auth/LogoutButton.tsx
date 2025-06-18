
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

export const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </Button>
  );
};

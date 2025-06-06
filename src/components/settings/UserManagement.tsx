
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'director', label: 'Director' },
  { value: 'ceo', label: 'CEO' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'user', label: 'User' }
];

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin' // Default to admin role
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    checkCurrentUserRole();
    fetchUsers();
  }, []);

  const checkCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setCurrentUserRole(profile?.role || 'admin');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Filter out the test@alltechzone.au user
      const filteredUsers = (data || []).filter(user => {
        // We'll need to get the email from auth.users table since it's not in user_profiles
        return true; // For now, we'll filter in the display logic
      });

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive"
      });
      return;
    }

    // Skip the test email filter for creation
    if (newUser.email === 'test@alltechzone.au') {
      toast({
        title: "Error",
        description: "Cannot create user with this email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('user-management/create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          role: newUser.role // Use the selected role (default is admin)
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user created successfully!"
      });

      setNewUser({ email: '', password: '', full_name: '', role: 'admin' });
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('user-management/delete-user', {
        body: { user_id: userId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully!"
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter out test user from display
  const displayUsers = users.filter(user => 
    // Filter based on user ID or any other unique identifier
    // Since we don't have email in user_profiles, we'll use a different approach
    user.id !== '19ccd4dd-e3f5-4ff0-abb0-4929c50071a7' // Hardcoded test user ID
  );

  return (
    <div className="space-y-6">
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Admin User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_email">Email</Label>
              <Input
                id="new_email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new_password">Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new_full_name">Full Name</Label>
              <Input
                id="new_full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new_role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateUser}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {loading ? "Creating..." : "Create Admin User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Users List */}
      <div className="grid gap-4">
        {displayUsers.map((user) => (
          <Card key={user.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{user.full_name || 'No name provided'}</p>
                  <p className="text-sm text-gray-600">Role: {user.role}</p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' || user.role === 'owner'
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayUsers.length === 0 && (
        <p className="text-center text-gray-500 py-8">No users found.</p>
      )}
    </div>
  );
};

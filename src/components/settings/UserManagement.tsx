
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SingleDeleteConfirmationModal } from "@/components/ui/single-delete-confirmation-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [updateRoleLoading, setUpdateRoleLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
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

    if (newUser.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating user with:', { email: newUser.email, full_name: newUser.full_name });
      
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'create',
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name || newUser.email
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Failed to create user');
      }

      if (data?.error) {
        console.error('Server error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        throw new Error('User creation failed - no success response');
      }

      toast({
        title: "Success",
        description: "Admin user created successfully!"
      });

      setNewUser({ email: '', password: '', full_name: '' });
      setIsCreateDialogOpen(false);
      fetchUsers();

    } catch (error: any) {
      console.error('Create user error:', error);
      
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = `A user with the email "${newUser.email}" already exists. Please use a different email address.`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: { 
          action: 'delete',
          user_id: userToDelete.id 
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Admin user deleted successfully!"
      });

      fetchUsers();
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditRoleClick = (user: any) => {
    setUserToEdit(user);
    setNewRole(user.role);
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!userToEdit || !newRole) return;

    setUpdateRoleLoading(true);

    try {
      console.log('Updating user role:', { userId: userToEdit.id, currentRole: userToEdit.role, newRole });

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userToEdit.id);

      if (error) {
        console.error('Role update error:', error);
        throw error;
      }

      console.log('Role updated successfully');

      toast({
        title: "Success",
        description: `User role updated to ${newRole} successfully!`
      });

      fetchUsers();
      setShowEditRoleModal(false);
      setUserToEdit(null);
      setNewRole('');

    } catch (error: any) {
      console.error('Complete update role error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdateRoleLoading(false);
    }
  };

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
                placeholder="admin@example.com"
                disabled={loading}
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
                placeholder="Strong password (min 6 characters)"
                minLength={6}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="new_full_name">Full Name</Label>
              <Input
                id="new_full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="mt-1"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All new users will be created with admin role and full access.
              </p>
            </div>
            <Button
              onClick={handleCreateUser}
              disabled={loading || !newUser.email || !newUser.password}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {loading ? "Creating..." : "Create Admin User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <p className="text-sm text-gray-600">{userToEdit?.full_name || 'No name provided'}</p>
              <p className="text-xs text-gray-500">{userToEdit?.id}</p>
            </div>
            <div>
              <Label htmlFor="role_select">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Changing a user's role will immediately affect their access permissions.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateRole}
                disabled={!newRole || newRole === userToEdit?.role || updateRoleLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
              >
                {updateRoleLoading ? "Updating..." : "Update Role"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditRoleModal(false);
                  setUserToEdit(null);
                  setNewRole('');
                }}
                className="flex-1"
                disabled={updateRoleLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{user.full_name || 'No name provided'}</p>
                  <p className="text-sm text-gray-600">Role: {user.role === 'admin' ? 'Administrator' : 'User'}</p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditRoleClick(user)}
                    disabled={updateRoleLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-gray-500 py-8">No users found.</p>
      )}

      {/* Delete User Confirmation Modal */}
      <SingleDeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete Admin User"
        description="Are you sure you want to delete this admin user? This action cannot be undone."
        itemName={userToDelete?.full_name || userToDelete?.id}
      />
    </div>
  );
};

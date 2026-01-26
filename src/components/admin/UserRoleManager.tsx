import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, UserPlus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "content_manager" | "user";
  created_at: string;
  profiles?: {
    email: string | null;
    full_name: string | null;
  } | null;
}

interface UserRoleManagerProps {
  onRefresh: () => void;
}

const UserRoleManager = ({ onRefresh }: UserRoleManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "content_manager">("content_manager");
  const [saving, setSaving] = useState(false);

  const fetchUserRoles = async () => {
    setLoading(true);
    
    // Fetch roles and profiles separately since there's no direct foreign key
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      setLoading(false);
      return;
    }
    
    if (rolesData && rolesData.length > 0) {
      // Fetch profiles separately
      const userIds = rolesData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);
      
      const rolesWithProfiles = rolesData.map(role => ({
        ...role,
        profiles: profiles?.find(p => p.user_id === role.user_id) || null
      }));
      setUserRoles(rolesWithProfiles as UserRole[]);
    } else {
      setUserRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const handleAddUser = async () => {
    if (!newUserEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // First, find the user by email in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", newUserEmail)
      .maybeSingle();

    if (profileError || !profile) {
      toast({
        title: "Error",
        description: "User not found. They must sign up first before being assigned a role.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", profile.user_id)
      .maybeSingle();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newUserRole })
        .eq("user_id", profile.user_id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `User role updated to ${newUserRole}`,
        });
        setIsAddDialogOpen(false);
        setNewUserEmail("");
        fetchUserRoles();
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role: newUserRole });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `User assigned as ${newUserRole}`,
        });
        setIsAddDialogOpen(false);
        setNewUserEmail("");
        fetchUserRoles();
      }
    }
    setSaving(false);
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "content_manager" | "user") => {
    // Prevent removing own admin role
    if (userId === user?.id && newRole !== "admin") {
      toast({
        title: "Error",
        description: "You cannot remove your own admin privileges",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User role updated",
      });
      fetchUserRoles();
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    // Prevent removing own role
    if (userId === user?.id) {
      toast({
        title: "Error",
        description: "You cannot remove your own role",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to remove this user's role?")) return;

    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User role removed",
      });
      fetchUserRoles();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "content_manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredRoles = userRoles.filter((ur) => {
    const email = ur.profiles?.email || "";
    const name = ur.profiles?.full_name || "";
    return (
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Admin/Manager
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users with special roles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((ur) => (
                  <TableRow key={ur.id}>
                    <TableCell className="font-medium">
                      {ur.profiles?.full_name || "Unknown"}
                      {ur.user_id === user?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </TableCell>
                    <TableCell>{ur.profiles?.email || ur.user_id}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(ur.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {ur.role === "content_manager" ? "Content Manager" : ur.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ur.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={ur.role}
                          onValueChange={(value: "admin" | "content_manager" | "user") =>
                            handleUpdateRole(ur.user_id, value)
                          }
                          disabled={ur.user_id === user?.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="content_manager">Content Manager</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                        {ur.user_id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveRole(ur.user_id, ur.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin or Content Manager</DialogTitle>
            <DialogDescription>
              Enter the email of a registered user to assign them admin or content manager privileges.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User Email</label>
              <Input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newUserRole}
                onValueChange={(value: "admin" | "content_manager") => setNewUserRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="content_manager">Content Manager (Blog & Gallery)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={saving}>
              {saving ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRoleManager;

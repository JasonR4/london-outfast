import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Shield, Edit2, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamManagerProps {
  userProfile: Profile | null;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ userProfile }) => {
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', role: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive"
      });
    } else {
      setTeamMembers(data || []);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can invite team members",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // In a real implementation, you would send an invitation email
    // For now, we'll just show a message about the invitation process
    toast({
      title: "Invitation Process",
      description: `To invite ${inviteEmail}, send them a link to register at /auth. Once they register, you can update their role here.`,
    });

    setInviteEmail('');
    setInviteRole('editor');
    setLoading(false);
  };

  const handleEditStart = (member: Profile) => {
    setEditingMember(member.id);
    setEditForm({
      full_name: member.full_name,
      role: member.role
    });
  };

  const handleEditSave = async (memberId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can edit team member roles",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        role: editForm.role
      })
      .eq('id', memberId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
      setEditingMember(null);
      fetchTeamMembers();
    }
  };

  const handleEditCancel = () => {
    setEditingMember(null);
    setEditForm({ full_name: '', role: '' });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'default';
      case 'viewer': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to all features';
      case 'editor': return 'Can create and edit content';
      case 'viewer': return 'View-only access';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - View only</SelectItem>
                      <SelectItem value="editor">Editor - Can edit content</SelectItem>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" disabled={loading} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    {editingMember === member.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-48"
                        />
                        <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium">{member.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleDescription(member.role)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {member.role}
                  </Badge>
                  
                  {isAdmin && member.user_id !== userProfile?.user_id && (
                    <>
                      {editingMember === member.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSave(member.id)}
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(member)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  )}
                  
                  {member.user_id === userProfile?.user_id && (
                    <Badge variant="outline">You</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">Viewer</Badge>
                <ul className="text-sm space-y-1">
                  <li>• View all content</li>
                  <li>• Access media library</li>
                  <li>• View team members</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <Badge variant="default" className="mb-2">Editor</Badge>
                <ul className="text-sm space-y-1">
                  <li>• All viewer permissions</li>
                  <li>• Create and edit content</li>
                  <li>• Upload media files</li>
                  <li>• Publish/unpublish pages</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <Badge variant="destructive" className="mb-2">Admin</Badge>
                <ul className="text-sm space-y-1">
                  <li>• All editor permissions</li>
                  <li>• Invite team members</li>
                  <li>• Manage user roles</li>
                  <li>• Delete content and media</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
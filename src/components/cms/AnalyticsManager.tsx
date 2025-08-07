import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Code, BarChart3, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AnalyticsCode {
  id: string;
  name: string;
  code_type: string;
  tracking_code: string;
  placement: string;
  is_active: boolean;
  priority: number;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

const codeTypeLabels = {
  gtm: 'Google Tag Manager',
  google_analytics: 'Google Analytics',
  facebook_pixel: 'Facebook Pixel',
  custom_script: 'Custom Script',
  custom_pixel: 'Custom Pixel'
};

const placementLabels = {
  head: 'Head Section',
  body_start: 'Body Start',
  body_end: 'Body End'
};

export function AnalyticsManager() {
  const [analyticsCodes, setAnalyticsCodes] = useState<AnalyticsCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<AnalyticsCode | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code_type: 'gtm',
    tracking_code: '',
    placement: 'head',
    is_active: true,
    priority: 0,
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsCodes();
  }, []);

  const fetchAnalyticsCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_codes')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setAnalyticsCodes(data || []);
    } catch (error) {
      console.error('Error fetching analytics codes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch analytics codes"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const dataToSubmit = {
        ...formData,
        created_by: userId,
        updated_by: userId
      };

      if (editingCode) {
        const { error } = await supabase
          .from('analytics_codes')
          .update(dataToSubmit)
          .eq('id', editingCode.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Analytics code updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('analytics_codes')
          .insert(dataToSubmit);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Analytics code added successfully"
        });
      }

      setIsDialogOpen(false);
      setEditingCode(null);
      resetForm();
      fetchAnalyticsCodes();
    } catch (error) {
      console.error('Error saving analytics code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save analytics code"
      });
    }
  };

  const handleEdit = (code: AnalyticsCode) => {
    setEditingCode(code);
    setFormData({
      name: code.name,
      code_type: code.code_type,
      tracking_code: code.tracking_code,
      placement: code.placement,
      is_active: code.is_active,
      priority: code.priority,
      description: code.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analytics code?')) return;

    try {
      const { error } = await supabase
        .from('analytics_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Analytics code deleted successfully"
      });
      
      fetchAnalyticsCodes();
    } catch (error) {
      console.error('Error deleting analytics code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete analytics code"
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('analytics_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      fetchAnalyticsCodes();
      toast({
        title: "Success",
        description: `Analytics code ${!currentStatus ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling analytics code status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update analytics code status"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code_type: 'gtm',
      tracking_code: '',
      placement: 'head',
      is_active: true,
      priority: 0,
      description: ''
    });
  };

  const openNewDialog = () => {
    setEditingCode(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Tracking
          </h2>
          <p className="text-muted-foreground">
            Manage GTM, Google Analytics, Facebook Pixel and other tracking codes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tracking Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Edit Analytics Code' : 'Add Analytics Code'}
              </DialogTitle>
              <DialogDescription>
                Add tracking scripts like GTM, Google Analytics, Facebook Pixel, or custom scripts
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., GTM Container"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code_type">Type *</Label>
                  <Select
                    value={formData.code_type}
                    onValueChange={(value) => setFormData({ ...formData, code_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(codeTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement *</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(value) => setFormData({ ...formData, placement: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(placementLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking_code">Tracking Code *</Label>
                <Textarea
                  id="tracking_code"
                  value={formData.tracking_code}
                  onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
                  placeholder="Paste your tracking code here..."
                  rows={8}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCode ? 'Update Code' : 'Add Code'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {analyticsCodes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tracking codes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first tracking code to start monitoring your website analytics
                </p>
                <Button onClick={openNewDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Tracking Code
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          analyticsCodes.map((code) => (
            <Card key={code.id}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {code.name}
                      <Badge variant={code.is_active ? "default" : "secondary"}>
                        {code.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {codeTypeLabels[code.code_type]}
                      </Badge>
                    </CardTitle>
                    {code.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {code.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Placement: {placementLabels[code.placement]}</span>
                      <span>Priority: {code.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={code.is_active}
                      onCheckedChange={() => toggleActive(code.id, code.is_active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(code)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                    {code.tracking_code.substring(0, 200)}
                    {code.tracking_code.length > 200 && '...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
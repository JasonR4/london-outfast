import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any;
  status: string;
  page_type: string;
  created_at: string;
  updated_at: string;
}

export const ContentEditor = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    meta_description: '',
    content: {
      hero_title: '',
      hero_description: '',
      sections: []
    },
    status: 'draft' as 'draft' | 'published',
    page_type: 'ooh_format' as 'ooh_format' | 'general' | 'landing'
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive"
      });
    } else {
      setPages(data || []);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      created_by: user.id,
      updated_by: user.id
    };

    let result;
    if (selectedPage) {
      result = await supabase
        .from('content_pages')
        .update(payload)
        .eq('id', selectedPage.id);
    } else {
      result = await supabase
        .from('content_pages')
        .insert(payload);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Page ${selectedPage ? 'updated' : 'created'} successfully`
      });
      fetchPages();
      setIsEditing(false);
      setSelectedPage(null);
      resetForm();
    }

    setLoading(false);
  };

  const handleEdit = (page: ContentPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      meta_description: page.meta_description || '',
      content: page.content,
      status: page.status as 'draft' | 'published',
      page_type: page.page_type as 'ooh_format' | 'general' | 'landing'
    });
    setIsEditing(true);
  };

  const handleDelete = async (page: ContentPage) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    const { error } = await supabase
      .from('content_pages')
      .delete()
      .eq('id', page.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Page deleted successfully"
      });
      fetchPages();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      meta_description: '',
      content: {
        hero_title: '',
        hero_description: '',
        sections: []
      },
      status: 'draft',
      page_type: 'ooh_format'
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Pages</h2>
            <Button onClick={() => { setIsEditing(true); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>

          <div className="grid gap-4">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/outdoor-media/${page.slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(page)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedPage ? 'Edit Page' : 'Create New Page'}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  placeholder="Page title"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="page_type">Page Type</Label>
                <Select value={formData.page_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, page_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ooh_format">OOH Format</SelectItem>
                    <SelectItem value="general">General Page</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  value={formData.content.hero_title || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, hero_title: e.target.value }
                  }))}
                  placeholder="Hero section title"
                />
              </div>

              <div>
                <Label htmlFor="hero_description">Hero Description</Label>
                <Textarea
                  id="hero_description"
                  value={formData.content.hero_description || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, hero_description: e.target.value }
                  }))}
                  placeholder="Hero section description"
                  rows={6}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
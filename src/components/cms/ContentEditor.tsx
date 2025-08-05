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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, Edit, Trash2, Eye, Image, Video, FileText, Upload, X, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { oohFormats } from '@/data/oohFormats';
import { FormatPageSections } from './FormatPageSections';

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
  is_static?: boolean;
}

export const ContentEditor = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<ContentPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ooh_format' | 'general' | 'landing'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'cms' | 'static'>('all');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    meta_description: '',
    content: {
      hero_title: '',
      hero_description: '',
      hero_image: '',
      sections: [] as any[],
      gallery: [] as string[],
      features: [] as any[],
      specifications: {} as any,
      pricing_info: '',
      booking_info: '',
      custom_html: ''
    },
    status: 'draft' as 'draft' | 'published',
    page_type: 'ooh_format' as 'ooh_format' | 'general' | 'landing'
  });

  useEffect(() => {
    fetchPages();
    fetchMediaFiles();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter, typeFilter, sourceFilter]);

  const filterPages = () => {
    let filtered = [...pages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.meta_description && page.meta_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(page => page.page_type === typeFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      if (sourceFilter === 'static') {
        filtered = filtered.filter(page => page.is_static);
      } else if (sourceFilter === 'cms') {
        filtered = filtered.filter(page => !page.is_static);
      }
    }

    setFilteredPages(filtered);
  };

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
      // All pages are now in CMS - just show them directly
      setPages(data || []);
    }
  };

  const fetchMediaFiles = async () => {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media:', error);
    } else {
      setMediaFiles(data || []);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // If it's a static OOH page, create a new CMS override
    const isStaticPage = selectedPage?.id?.startsWith('ooh_');
    
    const payload = {
      ...formData,
      slug: isStaticPage ? selectedPage.slug : formData.slug,
      created_by: user.id,
      updated_by: user.id
    };

    let result;
    if (selectedPage && !isStaticPage) {
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
        description: `Page ${selectedPage && !isStaticPage ? 'updated' : 'created'} successfully`
      });
      fetchPages();
      setIsEditing(false);
      setSelectedPage(null);
      resetForm();
    }

    setLoading(false);
  };

  const handleEdit = (page: ContentPage) => {
    const isStaticPage = page.id?.startsWith('ooh_');
    setSelectedPage(page);
    
    // Debug logging to see what's in the page content
    console.log('Editing page:', page.title);
    console.log('Page content.category:', page.content?.category);
    console.log('Full page content:', page.content);
    
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
    if (page.id?.startsWith('ooh_')) {
      toast({
        title: "Cannot Delete",
        description: "Static OOH format pages cannot be deleted, only customized",
        variant: "destructive"
      });
      return;
    }
    
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
        hero_image: '',
        sections: [],
        gallery: [],
        features: [],
        specifications: {},
        pricing_info: '',
        booking_info: '',
        custom_html: ''
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

  const insertMedia = (mediaFile: any) => {
    const mediaUrl = getMediaUrl(mediaFile);
    
    if (editingSection === 'hero_image') {
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, hero_image: mediaUrl }
      }));
    } else if (editingSection === 'showcase_image') {
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, showcase_image: mediaUrl }
      }));
    } else if (editingSection === 'gallery') {
      setFormData(prev => ({
        ...prev,
        content: { 
          ...prev.content, 
          gallery: [...(prev.content.gallery || []), mediaUrl] 
        }
      }));
    } else if (editingSection?.startsWith('section_')) {
      const sectionIndex = parseInt(editingSection.split('_')[1]);
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          sections: prev.content.sections?.map((section, index) => 
            index === sectionIndex ? { ...section, image: mediaUrl } : section
          ) || []
        }
      }));
    }
    
    setShowMediaLibrary(false);
    setEditingSection(null);
  };

  const getMediaUrl = (mediaFile: any) => {
    const [bucket, ...pathParts] = mediaFile.storage_path.split('/');
    const filePath = pathParts.join('/');
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: [
          ...(prev.content.sections || []),
          {
            id: Date.now().toString(),
            type: 'text',
            title: '',
            content: '',
            image: '',
            order: (prev.content.sections?.length || 0) + 1
          }
        ]
      }
    }));
  };

  const updateSection = (sectionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections?.map(section => 
          section.id === sectionId ? { ...section, [field]: value } : section
        ) || []
      }
    }));
  };

  const removeSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections?.filter(section => section.id !== sectionId) || []
      }
    }));
  };

  const removeFromGallery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        gallery: prev.content.gallery?.filter((_, i) => i !== index) || []
      }
    }));
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

          {/* Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter & Search Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="content-search">Search Pages</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="content-search"
                      placeholder="Search by title, slug..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content-status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'draft' | 'published') => setStatusFilter(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content-type-filter">Filter by Type</Label>
                  <Select value={typeFilter} onValueChange={(value: 'all' | 'ooh_format' | 'general' | 'landing') => setTypeFilter(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ooh_format">OOH Formats</SelectItem>
                      <SelectItem value="general">General Pages</SelectItem>
                      <SelectItem value="landing">Landing Pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content-source-filter">Filter by Source</Label>
                  <Select value={sourceFilter} onValueChange={(value: 'all' | 'cms' | 'static') => setSourceFilter(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="cms">CMS Pages</SelectItem>
                      <SelectItem value="static">Static Pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPages.length} of {pages.length} pages
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSourceFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredPages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No pages found matching your filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{page.title}</h3>
                        {page.is_static && (
                          <Badge variant="outline">Static</Badge>
                        )}
                      </div>
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
                      {!page.is_static && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(page)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedPage?.is_static ? `Customize ${selectedPage.title}` : 
               selectedPage ? 'Edit Page' : 'Create New Page'}
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

          <Tabs defaultValue="sections" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sections">Page Sections</TabsTrigger>
              <TabsTrigger value="custom">Custom Sections</TabsTrigger>
              <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-6">
              <FormatPageSections
                content={formData.content}
                onUpdateContent={(content) => setFormData(prev => ({ ...prev, content }))}
                onOpenMediaLibrary={(section) => {
                  setEditingSection(section);
                  setShowMediaLibrary(true);
                }}
                mediaFiles={mediaFiles}
              />
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {/* Custom Sections - Legacy Support */}
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Hero Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.content.hero_image || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          content: { ...prev.content, hero_image: e.target.value }
                        }))}
                        placeholder="Image URL"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingSection('hero_image');
                          setShowMediaLibrary(true);
                        }}
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.content.hero_image && (
                      <img 
                        src={formData.content.hero_image} 
                        alt="Hero" 
                        className="mt-2 max-w-xs rounded"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content Sections */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Content Sections</CardTitle>
                    <Button onClick={addSection} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.content.sections?.map((section: any, index: number) => (
                    <Card key={section.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Section {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label>Section Type</Label>
                          <Select 
                            value={section.type} 
                            onValueChange={(value) => updateSection(section.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="text_image">Text + Image</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Section Title</Label>
                          <Input
                            value={section.title || ''}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            placeholder="Section title"
                          />
                        </div>

                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={section.content || ''}
                            onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                            placeholder="Section content"
                            rows={4}
                          />
                        </div>

                        {(section.type === 'image' || section.type === 'video' || section.type === 'text_image') && (
                          <div>
                            <Label>Media URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={section.image || ''}
                                onChange={(e) => updateSection(section.id, 'image', e.target.value)}
                                placeholder="Media URL"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingSection(`section_${section.id}`);
                                  setShowMediaLibrary(true);
                                }}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Page Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          title,
                          slug: selectedPage?.is_static ? prev.slug : generateSlug(title)
                        }));
                      }}
                      placeholder="Page title"
                    />
                  </div>

                  {!selectedPage?.is_static && (
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="page-url-slug"
                      />
                    </div>
                  )}

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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="cursor-pointer border rounded-lg p-2 hover:bg-muted"
                onClick={() => insertMedia(file)}
              >
                {file.file_type.startsWith('image/') ? (
                  <img
                    src={getMediaUrl(file)}
                    alt={file.original_name}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : file.file_type.startsWith('video/') ? (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    <Video className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <p className="text-xs mt-2 truncate">{file.original_name}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
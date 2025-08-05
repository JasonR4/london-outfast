import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, FileText, Eye, Edit, Trash2 } from 'lucide-react';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const LegalPagesEditor = () => {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    meta_description: '',
    sections: [{ heading: '', content: '' }]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLegalPages();
  }, []);

  const fetchLegalPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .in('slug', ['privacy-policy', 'terms-of-service', 'cookie-policy', 'disclaimer'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      console.log('Legal pages fetched:', data); // Debug log
      setLegalPages(data || []);
    } catch (error) {
      console.error('Error fetching legal pages:', error);
      toast({
        title: "Error",
        description: "Failed to load legal pages",
        variant: "destructive"
      });
    }
  };

  const handlePageSelect = (page: LegalPage) => {
    console.log('Selecting legal page:', page); // Debug log
    setSelectedPage(page);
    setEditForm({
      title: page.title,
      meta_description: page.meta_description || '',
      sections: page.content?.sections || [{ heading: '', content: '' }]
    });
    setIsEditing(false);
    console.log('Page selected, editForm set:', {
      title: page.title,
      sections: page.content?.sections?.length || 0
    }); // Debug log
  };

  const addSection = () => {
    setEditForm(prev => ({
      ...prev,
      sections: [...prev.sections, { heading: '', content: '' }]
    }));
  };

  const updateSection = (index: number, field: 'heading' | 'content', value: string) => {
    setEditForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const savePage = async () => {
    if (!selectedPage) return;

    try {
      const { error } = await supabase
        .from('content_pages')
        .update({
          title: editForm.title,
          meta_description: editForm.meta_description,
          content: {
            ...selectedPage.content,
            sections: editForm.sections
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Legal page updated successfully"
      });

      setIsEditing(false);
      fetchLegalPages();
    } catch (error) {
      console.error('Error saving legal page:', error);
      toast({
        title: "Error",
        description: "Failed to save legal page",
        variant: "destructive"
      });
    }
  };

  const createNewLegalPage = async () => {
    const newSlug = prompt('Enter slug for new legal page (e.g., cookie-policy):');
    if (!newSlug) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create pages",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('content_pages')
        .insert({
          slug: newSlug,
          title: `New Legal Page - ${newSlug}`,
          meta_description: '',
          content: {
            sections: [{ heading: 'Introduction', content: 'Content goes here...' }]
          },
          status: 'draft',
          page_type: 'ooh_format',
          created_by: user.id,
          updated_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New legal page created"
      });

      fetchLegalPages();
    } catch (error) {
      console.error('Error creating legal page:', error);
      toast({
        title: "Error",
        description: "Failed to create legal page",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Left Panel - Legal Pages List */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Legal Pages</CardTitle>
          <Button onClick={createNewLegalPage} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            <div className="space-y-2">
              {legalPages.map((page) => (
                <div
                  key={page.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPage?.id === page.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handlePageSelect(page)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-sm">{page.title}</span>
                    </div>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">/{page.slug}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Content Editor/Viewer */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{selectedPage ? selectedPage.title : 'Select a Legal Page'}</CardTitle>
            {selectedPage && (
              <p className="text-sm text-muted-foreground">/{selectedPage.slug}</p>
            )}
          </div>
          {selectedPage && (
            <div className="flex space-x-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={savePage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedPage ? (
            <div className="h-[700px]">
              {isEditing ? (
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        value={editForm.meta_description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, meta_description: e.target.value }))}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-base font-semibold">Content Sections</Label>
                        <Button onClick={addSection} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Section
                        </Button>
                      </div>

                      {editForm.sections.map((section, index) => (
                        <Card key={index} className="mb-4">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Label className="text-sm font-medium">Section {index + 1}</Label>
                            {editForm.sections.length > 1 && (
                              <Button
                                onClick={() => removeSection(index)}
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor={`heading-${index}`}>Heading</Label>
                              <Input
                                id={`heading-${index}`}
                                value={section.heading}
                                onChange={(e) => updateSection(index, 'heading', e.target.value)}
                                placeholder="Section heading"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`content-${index}`}>Content</Label>
                              <Textarea
                                id={`content-${index}`}
                                value={section.content}
                                onChange={(e) => updateSection(index, 'content', e.target.value)}
                                placeholder="Section content..."
                                className="mt-1"
                                rows={8}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="border rounded-lg bg-background h-full">
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Preview Mode</span>
                      </div>
                      <Badge variant={selectedPage.status === 'published' ? 'default' : 'secondary'}>
                        {selectedPage.status}
                      </Badge>
                    </div>
                  </div>
                  <ScrollArea className="h-[620px]">
                    <div className="p-6 prose prose-sm max-w-none">
                      <h1 className="text-2xl font-bold mb-4">{selectedPage.title}</h1>
                      
                      {selectedPage.content?.sections?.map((section, index) => (
                        <div key={index} className="mb-6">
                          {section.heading && (
                            <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[700px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a legal page from the list to view or edit its content</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
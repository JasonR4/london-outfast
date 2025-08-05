import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, FileText, Edit, Trash2 } from 'lucide-react';

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
      
      console.log('Legal pages fetched:', data);
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
    console.log('Selecting legal page:', page);
    setSelectedPage(page);
    setEditForm({
      title: page.title,
      meta_description: page.meta_description || '',
      sections: page.content?.sections || [{ heading: '', content: '' }]
    });
    setIsEditing(false);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Legal Pages Editor</h2>
        <Badge variant="outline">{legalPages.length} pages</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Legal Pages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legal Pages</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Content Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedPage ? selectedPage.title : 'Select a Legal Page'}</CardTitle>
                  {selectedPage && (
                    <p className="text-sm text-muted-foreground mt-1">/{selectedPage.slug}</p>
                  )}
                </div>
                {selectedPage && (
                  <div className="flex space-x-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                    {isEditing && (
                      <Button variant="default" size="sm" onClick={savePage}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedPage ? (
                isEditing ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Meta Description */}
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

                      {/* Content Sections */}
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
                                  rows={6}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="prose prose-sm max-w-none">
                      <h1 className="text-2xl font-bold mb-4">{selectedPage.title}</h1>
                      
                      {selectedPage.content?.sections?.map((section: any, index: number) => (
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
                )
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a legal page from the list to view or edit its content</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
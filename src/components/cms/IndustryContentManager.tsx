import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface Industry {
  id?: string;
  slug: string;
  title: string;
  meta_description: string;
  content: {
    sections: ContentSection[];
    description?: string;
  };
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

interface ContentSection {
  type: 'hero' | 'features' | 'cta';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  items?: string[];
  button?: {
    text: string;
    url: string;
  };
}

const IndustryContentManager = () => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Industry>({
    slug: '',
    title: '',
    meta_description: '',
    content: { sections: [] },
    status: 'draft'
  });

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('page_type', 'industry')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Type the data properly
      const typedData = (data || []).map(item => ({
        ...item,
        content: (item.content as unknown) as { sections: ContentSection[]; description?: string; }
      })) as Industry[];
      
      setIndustries(typedData);
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast({
        title: "Error",
        description: "Failed to load industries",
        variant: "destructive",
      });
    }
  };

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setEditForm(industry);
    setIsEditing(false);
    setIsCreating(false);
  };

  const startCreating = () => {
    const newIndustry: Industry = {
      slug: '',
      title: '',
      meta_description: '',
      content: { 
        sections: [
          {
            type: 'hero',
            title: '',
            subtitle: '',
            description: '',
            image: '',
            button: { text: 'Get Quote', url: '/quote' }
          }
        ]
      },
      status: 'draft'
    };
    setEditForm(newIndustry);
    setSelectedIndustry(null);
    setIsCreating(true);
    setIsEditing(true);
  };

  const addSection = () => {
    const newSection: ContentSection = {
      type: 'features',
      title: '',
      description: '',
      items: []
    };
    setEditForm({
      ...editForm,
      content: {
        ...editForm.content,
        sections: [...editForm.content.sections, newSection]
      }
    });
  };

  const updateSection = (index: number, updatedSection: ContentSection) => {
    const newSections = [...editForm.content.sections];
    newSections[index] = updatedSection;
    setEditForm({
      ...editForm,
      content: {
        ...editForm.content,
        sections: newSections
      }
    });
  };

  const removeSection = (index: number) => {
    const newSections = editForm.content.sections.filter((_, i) => i !== index);
    setEditForm({
      ...editForm,
      content: {
        ...editForm.content,
        sections: newSections
      }
    });
  };

  const saveIndustry = async () => {
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('content_pages')
          .insert({
            slug: editForm.slug,
            title: editForm.title,
            meta_description: editForm.meta_description,
            content: editForm.content as any,
            status: editForm.status,
            page_type: 'industry',
            created_by: (await supabase.auth.getUser()).data.user?.id || '',
            updated_by: (await supabase.auth.getUser()).data.user?.id || ''
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Industry created successfully",
        });
      } else if (selectedIndustry) {
        const { error } = await supabase
          .from('content_pages')
          .update({
            title: editForm.title,
            meta_description: editForm.meta_description,
            content: editForm.content as any,
            status: editForm.status,
            updated_by: (await supabase.auth.getUser()).data.user?.id || ''
          })
          .eq('id', selectedIndustry.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Industry updated successfully",
        });
      }

      setIsEditing(false);
      setIsCreating(false);
      await fetchIndustries();
    } catch (error) {
      console.error('Error saving industry:', error);
      toast({
        title: "Error",
        description: "Failed to save industry",
        variant: "destructive",
      });
    }
  };

  const deleteIndustry = async (industryId: string) => {
    if (!confirm('Are you sure you want to delete this industry?')) return;

    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', industryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Industry deleted successfully",
      });

      if (selectedIndustry?.id === industryId) {
        setSelectedIndustry(null);
      }
      await fetchIndustries();
    } catch (error) {
      console.error('Error deleting industry:', error);
      toast({
        title: "Error",
        description: "Failed to delete industry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      {/* Industries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Industries</h3>
          <Button onClick={startCreating} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Industry
          </Button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {industries.map((industry) => (
            <Card 
              key={industry.id} 
              className={`cursor-pointer transition-colors ${
                selectedIndustry?.id === industry.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleIndustrySelect(industry)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{industry.title}</h4>
                    <p className="text-sm text-muted-foreground">/{industry.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={industry.status === 'published' ? 'default' : 'secondary'}>
                      {industry.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIndustry(industry.id!);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Industry Editor */}
      <div className="md:col-span-2">
        {(selectedIndustry || isCreating) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isCreating ? 'Create New Industry' : selectedIndustry?.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={saveIndustry}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                          if (selectedIndustry) setEditForm(selectedIndustry);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                          disabled={!isCreating}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={editForm.meta_description}
                        onChange={(e) => setEditForm({...editForm, meta_description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value: 'draft' | 'published') => setEditForm({...editForm, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Content Sections</h4>
                      <Button onClick={addSection} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </div>
                    {editForm.content.sections.map((section, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Section {index + 1} - {section.type}</h5>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeSection(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Section Type</Label>
                              <Select
                                value={section.type}
                                onValueChange={(value: 'hero' | 'features' | 'cta') => 
                                  updateSection(index, {...section, type: value})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hero">Hero</SelectItem>
                                  <SelectItem value="features">Features</SelectItem>
                                  <SelectItem value="cta">Call to Action</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(index, {...section, title: e.target.value})}
                              />
                            </div>
                          </div>
                          {section.subtitle !== undefined && (
                            <div>
                              <Label>Subtitle</Label>
                              <Input
                                value={section.subtitle}
                                onChange={(e) => updateSection(index, {...section, subtitle: e.target.value})}
                              />
                            </div>
                          )}
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={section.description}
                              onChange={(e) => updateSection(index, {...section, description: e.target.value})}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <p><strong>Slug:</strong> /{selectedIndustry?.slug}</p>
                    <p><strong>Status:</strong> {selectedIndustry?.status}</p>
                    <p className="mt-2">{selectedIndustry?.meta_description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content Sections</h4>
                    <p className="text-muted-foreground">
                      {selectedIndustry?.content.sections.length} sections configured
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IndustryContentManager;
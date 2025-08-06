import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2 } from 'lucide-react';

interface HomepageContent {
  id: string;
  section_key: string;
  content: any;
  is_active: boolean;
}

const HomepageContentManager = () => {
  const [homepageData, setHomepageData] = useState<Record<string, HomepageContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('section_key');

      if (error) throw error;

      const contentMap = data.reduce((acc, item) => {
        acc[item.section_key] = item;
        return acc;
      }, {} as Record<string, HomepageContent>);

      setHomepageData(contentMap);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      toast({
        title: "Error",
        description: "Failed to load homepage content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (sectionKey: string, content: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_content')
        .update({ 
          content,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('section_key', sectionKey);

      if (error) throw error;

      setHomepageData(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          content
        }
      }));

      toast({
        title: "Success",
        description: `${sectionKey} section updated successfully`
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (sectionKey: string, field: string, value: any) => {
    const currentContent = homepageData[sectionKey]?.content || {};
    const updatedContent = { ...currentContent, [field]: value };
    updateContent(sectionKey, updatedContent);
  };

  const updateArrayItem = (sectionKey: string, arrayField: string, index: number, item: any) => {
    const currentContent = homepageData[sectionKey]?.content || {};
    const currentArray = currentContent[arrayField] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = item;
    const updatedContent = { ...currentContent, [arrayField]: updatedArray };
    updateContent(sectionKey, updatedContent);
  };

  const addArrayItem = (sectionKey: string, arrayField: string, newItem: any) => {
    const currentContent = homepageData[sectionKey]?.content || {};
    const currentArray = currentContent[arrayField] || [];
    const updatedContent = { ...currentContent, [arrayField]: [...currentArray, newItem] };
    updateContent(sectionKey, updatedContent);
  };

  const removeArrayItem = (sectionKey: string, arrayField: string, index: number) => {
    const currentContent = homepageData[sectionKey]?.content || {};
    const currentArray = currentContent[arrayField] || [];
    const updatedArray = currentArray.filter((_: any, i: number) => i !== index);
    const updatedContent = { ...currentContent, [arrayField]: updatedArray };
    updateContent(sectionKey, updatedContent);
  };

  if (loading) {
    return <div className="text-center py-8">Loading homepage content...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="configurator_teaser">Configurator</TabsTrigger>
          <TabsTrigger value="why_choose_us">Why Choose Us</TabsTrigger>
          <TabsTrigger value="planning_tools">Planning Tools</TabsTrigger>
          <TabsTrigger value="format_links">Format Links</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="badge_text">Badge Text</Label>
                <Input
                  id="badge_text"
                  value={homepageData.hero?.content?.badge_text || ''}
                  onChange={(e) => updateField('hero', 'badge_text', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="main_title">Main Title</Label>
                <Input
                  id="main_title"
                  value={homepageData.hero?.content?.main_title || ''}
                  onChange={(e) => updateField('hero', 'main_title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={homepageData.hero?.content?.subtitle || ''}
                  onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={homepageData.hero?.content?.description || ''}
                  onChange={(e) => updateField('hero', 'description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_button_text">Primary Button Text</Label>
                  <Input
                    id="primary_button_text"
                    value={homepageData.hero?.content?.primary_button_text || ''}
                    onChange={(e) => updateField('hero', 'primary_button_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_button_text">Secondary Button Text</Label>
                  <Input
                    id="secondary_button_text"
                    value={homepageData.hero?.content?.secondary_button_text || ''}
                    onChange={(e) => updateField('hero', 'secondary_button_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="browse_button_text">Browse Button Text</Label>
                  <Input
                    id="browse_button_text"
                    value={homepageData.hero?.content?.browse_button_text || ''}
                    onChange={(e) => updateField('hero', 'browse_button_text', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="services_badge">Badge Text</Label>
                  <Input
                    id="services_badge"
                    value={homepageData.services?.content?.badge_text || ''}
                    onChange={(e) => updateField('services', 'badge_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="services_title">Title</Label>
                  <Input
                    id="services_title"
                    value={homepageData.services?.content?.title || ''}
                    onChange={(e) => updateField('services', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="services_description">Description</Label>
                  <Input
                    id="services_description"
                    value={homepageData.services?.content?.description || ''}
                    onChange={(e) => updateField('services', 'description', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Services</h4>
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('services', 'services', {
                      title: 'New Service',
                      description: 'Service description',
                      formats: []
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                
                {homepageData.services?.content?.services?.map((service: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Service {index + 1}</h5>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('services', 'services', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={service.title || ''}
                            onChange={(e) => updateArrayItem('services', 'services', index, {
                              ...service,
                              title: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={service.description || ''}
                            onChange={(e) => updateArrayItem('services', 'services', index, {
                              ...service,
                              description: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Formats (comma separated)</Label>
                          <Textarea
                            value={service.formats?.join(', ') || ''}
                            onChange={(e) => updateArrayItem('services', 'services', index, {
                              ...service,
                              formats: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why_choose_us">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Us Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="why_badge">Badge Text</Label>
                  <Input
                    id="why_badge"
                    value={homepageData.why_choose_us?.content?.badge_text || ''}
                    onChange={(e) => updateField('why_choose_us', 'badge_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="why_title">Title</Label>
                  <Input
                    id="why_title"
                    value={homepageData.why_choose_us?.content?.title || ''}
                    onChange={(e) => updateField('why_choose_us', 'title', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="why_description">Description</Label>
                <Textarea
                  id="why_description"
                  value={homepageData.why_choose_us?.content?.description || ''}
                  onChange={(e) => updateField('why_choose_us', 'description', e.target.value)}
                />
              </div>

              {/* Features Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Features</h4>
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('why_choose_us', 'features', {
                      title: 'New Feature',
                      description: 'Feature description',
                      highlight: 'Highlight text'
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                
                {homepageData.why_choose_us?.content?.features?.map((feature: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Feature {index + 1}</h5>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('why_choose_us', 'features', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={feature.title || ''}
                            onChange={(e) => updateArrayItem('why_choose_us', 'features', index, {
                              ...feature,
                              title: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Highlight</Label>
                          <Input
                            value={feature.highlight || ''}
                            onChange={(e) => updateArrayItem('why_choose_us', 'features', index, {
                              ...feature,
                              highlight: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description || ''}
                            onChange={(e) => updateArrayItem('why_choose_us', 'features', index, {
                              ...feature,
                              description: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Clients Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clients_badge">Clients Badge Text</Label>
                  <Input
                    id="clients_badge"
                    value={homepageData.why_choose_us?.content?.clients_badge || ''}
                    onChange={(e) => updateField('why_choose_us', 'clients_badge', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clients_title">Clients Title</Label>
                  <Input
                    id="clients_title"
                    value={homepageData.why_choose_us?.content?.clients_title || ''}
                    onChange={(e) => updateField('why_choose_us', 'clients_title', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clients_list">Client Types (one per line)</Label>
                <Textarea
                  id="clients_list"
                  rows={6}
                  value={homepageData.why_choose_us?.content?.clients?.join('\n') || ''}
                  onChange={(e) => updateField('why_choose_us', 'clients', e.target.value.split('\n').filter(c => c.trim()))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurator_teaser">
          <Card>
            <CardHeader>
              <CardTitle>Configurator Teaser Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ct_badge">Badge Text</Label>
                  <Input
                    id="ct_badge"
                    value={homepageData.configurator_teaser?.content?.badge_text || ''}
                    onChange={(e) => updateField('configurator_teaser', 'badge_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ct_title">Title</Label>
                  <Input
                    id="ct_title"
                    value={homepageData.configurator_teaser?.content?.title || ''}
                    onChange={(e) => updateField('configurator_teaser', 'title', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ct_description">Description</Label>
                <Textarea
                  id="ct_description"
                  value={homepageData.configurator_teaser?.content?.description || ''}
                  onChange={(e) => updateField('configurator_teaser', 'description', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ct_button">Button Text</Label>
                <Input
                  id="ct_button"
                  value={homepageData.configurator_teaser?.content?.button_text || ''}
                  onChange={(e) => updateField('configurator_teaser', 'button_text', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning_tools">
          <Card>
            <CardHeader>
              <CardTitle>Planning Tools Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pt_badge">Badge Text</Label>
                  <Input
                    id="pt_badge"
                    value={homepageData.planning_tools?.content?.badge_text || ''}
                    onChange={(e) => updateField('planning_tools', 'badge_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pt_title">Title</Label>
                  <Input
                    id="pt_title"
                    value={homepageData.planning_tools?.content?.title || ''}
                    onChange={(e) => updateField('planning_tools', 'title', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pt_description">Description</Label>
                <Textarea
                  id="pt_description"
                  value={homepageData.planning_tools?.content?.description || ''}
                  onChange={(e) => updateField('planning_tools', 'description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format_links">
          <Card>
            <CardHeader>
              <CardTitle>Format Links Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fl_badge">Badge Text</Label>
                  <Input
                    id="fl_badge"
                    value={homepageData.format_links?.content?.badge_text || ''}
                    onChange={(e) => updateField('format_links', 'badge_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fl_title">Title</Label>
                  <Input
                    id="fl_title"
                    value={homepageData.format_links?.content?.title || ''}
                    onChange={(e) => updateField('format_links', 'title', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fl_description">Description</Label>
                <Input
                  id="fl_description"
                  value={homepageData.format_links?.content?.description || ''}
                  onChange={(e) => updateField('format_links', 'description', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fl_view_all">View All Button Text</Label>
                <Input
                  id="fl_view_all"
                  value={homepageData.format_links?.content?.view_all_text || ''}
                  onChange={(e) => updateField('format_links', 'view_all_text', e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Format Links</h4>
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('format_links', 'formats', {
                      name: 'New Format',
                      slug: 'new-format'
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Format
                  </Button>
                </div>
                
                {homepageData.format_links?.content?.formats?.map((format: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Format {index + 1}</h5>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('format_links', 'formats', index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={format.name || ''}
                            onChange={(e) => updateArrayItem('format_links', 'formats', index, {
                              ...format,
                              name: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Slug</Label>
                          <Input
                            value={format.slug || ''}
                            onChange={(e) => updateArrayItem('format_links', 'formats', index, {
                              ...format,
                              slug: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta">
          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cta_badge">Badge Text</Label>
                <Input
                  id="cta_badge"
                  value={homepageData.cta?.content?.badge_text || ''}
                  onChange={(e) => updateField('cta', 'badge_text', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cta_title">Title</Label>
                <Input
                  id="cta_title"
                  value={homepageData.cta?.content?.title || ''}
                  onChange={(e) => updateField('cta', 'title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cta_description">Description</Label>
                <Textarea
                  id="cta_description"
                  value={homepageData.cta?.content?.description || ''}
                  onChange={(e) => updateField('cta', 'description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_primary">Primary Button Text</Label>
                  <Input
                    id="cta_primary"
                    value={homepageData.cta?.content?.primary_button_text || ''}
                    onChange={(e) => updateField('cta', 'primary_button_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cta_secondary">Secondary Button Text</Label>
                  <Input
                    id="cta_secondary"
                    value={homepageData.cta?.content?.secondary_button_text || ''}
                    onChange={(e) => updateField('cta', 'secondary_button_text', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomepageContentManager;
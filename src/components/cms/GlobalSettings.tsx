import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, Trash2, Navigation, Building2 } from 'lucide-react';

interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  is_active: boolean;
}

export const GlobalSettings = () => {
  const [navigationData, setNavigationData] = useState<any>(null);
  const [footerData, setFooterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .in('setting_key', ['main_navigation', 'main_footer']);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch global settings",
        variant: "destructive"
      });
      return;
    }

    data?.forEach((setting: GlobalSetting) => {
      if (setting.setting_key === 'main_navigation') {
        setNavigationData(setting.setting_value);
      } else if (setting.setting_key === 'main_footer') {
        setFooterData(setting.setting_value);
      }
    });
  };

  const saveSettings = async (settingKey: string, settingValue: any, settingType: string) => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('global_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        setting_type: settingType,
        created_by: user.id,
        updated_by: user.id
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    }

    setLoading(false);
  };

  const updateNavigation = (field: string, value: any, index?: number) => {
    const updated = { ...navigationData };
    
    if (field === 'menu_items' && index !== undefined) {
      updated.menu_items[index] = value;
    } else if (field === 'add_menu_item') {
      updated.menu_items = [...(updated.menu_items || []), value];
    } else if (field === 'remove_menu_item' && index !== undefined) {
      updated.menu_items = updated.menu_items.filter((_: any, i: number) => i !== index);
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[parent] = { ...updated[parent], [child]: value };
    } else {
      updated[field] = value;
    }
    
    setNavigationData(updated);
  };

  const updateFooter = (field: string, value: any, index?: number) => {
    const updated = { ...footerData };
    
    if (field === 'add_service_link') {
      if (!updated.links) updated.links = {};
      updated.links.services = [...(updated.links.services || []), value];
    } else if (field === 'remove_service_link' && index !== undefined) {
      updated.links.services = updated.links.services.filter((_: any, i: number) => i !== index);
    } else if (field === 'services_links' && index !== undefined) {
      updated.links.services[index] = value;
    } else if (field === 'add_company_link') {
      if (!updated.links) updated.links = {};
      updated.links.company = [...(updated.links.company || []), value];
    } else if (field === 'remove_company_link' && index !== undefined) {
      updated.links.company = updated.links.company.filter((_: any, i: number) => i !== index);
    } else if (field === 'company_links' && index !== undefined) {
      updated.links.company[index] = value;
    } else if (field === 'add_legal_link') {
      if (!updated.links) updated.links = {};
      updated.links.legal = [...(updated.links.legal || []), value];
    } else if (field === 'remove_legal_link' && index !== undefined) {
      updated.links.legal = updated.links.legal.filter((_: any, i: number) => i !== index);
    } else if (field === 'legal_links' && index !== undefined) {
      updated.links.legal[index] = value;
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[parent] = { ...updated[parent], [child]: value };
    } else {
      updated[field] = value;
    }
    
    setFooterData(updated);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="navigation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {navigationData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Logo Text</Label>
                      <Input
                        value={navigationData.logo?.text || ''}
                        onChange={(e) => updateNavigation('logo.text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={navigationData.logo?.url || ''}
                        onChange={(e) => updateNavigation('logo.url', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={navigationData.phone || ''}
                        onChange={(e) => updateNavigation('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>CTA Text</Label>
                      <Input
                        value={navigationData.cta_text || ''}
                        onChange={(e) => updateNavigation('cta_text', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Menu Items</Label>
                      <Button
                        size="sm"
                        onClick={() => updateNavigation('add_menu_item', { label: '', url: '', type: 'internal' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {navigationData.menu_items?.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                          <div className="flex-1">
                            <Label>Label</Label>
                            <Input
                              value={item.label || ''}
                              onChange={(e) => updateNavigation('menu_items', { ...item, label: e.target.value }, index)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>URL</Label>
                            <Input
                              value={item.url || ''}
                              onChange={(e) => updateNavigation('menu_items', { ...item, url: e.target.value }, index)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateNavigation('remove_menu_item', null, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => saveSettings('main_navigation', navigationData, 'navigation')} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Navigation
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {footerData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={footerData.company?.name || ''}
                        onChange={(e) => updateFooter('company.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={footerData.company?.phone || ''}
                        onChange={(e) => updateFooter('company.phone', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Company Description</Label>
                      <Textarea
                        rows={3}
                        value={footerData.company?.description || ''}
                        onChange={(e) => updateFooter('company.description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={footerData.company?.address || ''}
                        onChange={(e) => updateFooter('company.address', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={footerData.company?.email || ''}
                        onChange={(e) => updateFooter('company.email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Copyright Text</Label>
                    <Input
                      value={footerData.copyright || ''}
                      onChange={(e) => updateFooter('copyright', e.target.value)}
                    />
                  </div>

                  {/* Services Links */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Services Links</Label>
                      <Button
                        size="sm"
                        onClick={() => updateFooter('add_service_link', { label: '', url: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {footerData.links?.services?.map((link: any, index: number) => (
                        <div key={index} className="flex gap-4 items-end p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label>Label</Label>
                            <Input
                              value={link.label || ''}
                              onChange={(e) => updateFooter('services_links', { ...link, label: e.target.value }, index)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>URL</Label>
                            <Input
                              value={link.url || ''}
                              onChange={(e) => updateFooter('services_links', { ...link, url: e.target.value }, index)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFooter('remove_service_link', null, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Company Links */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Company Links</Label>
                      <Button
                        size="sm"
                        onClick={() => updateFooter('add_company_link', { label: '', url: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Company Link
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {footerData.links?.company?.map((link: any, index: number) => (
                        <div key={index} className="flex gap-4 items-end p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label>Label</Label>
                            <Input
                              value={link.label || ''}
                              onChange={(e) => updateFooter('company_links', { ...link, label: e.target.value }, index)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>URL</Label>
                            <Input
                              value={link.url || ''}
                              onChange={(e) => updateFooter('company_links', { ...link, url: e.target.value }, index)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFooter('remove_company_link', null, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Legal Links */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Legal Links</Label>
                      <Button
                        size="sm"
                        onClick={() => updateFooter('add_legal_link', { label: '', url: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Legal Link
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {footerData.links?.legal?.map((link: any, index: number) => (
                        <div key={index} className="flex gap-4 items-end p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label>Label</Label>
                            <Input
                              value={link.label || ''}
                              onChange={(e) => updateFooter('legal_links', { ...link, label: e.target.value }, index)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>URL</Label>
                            <Input
                              value={link.url || ''}
                              onChange={(e) => updateFooter('legal_links', { ...link, url: e.target.value }, index)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFooter('remove_legal_link', null, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div>
                    <Label className="text-base font-semibold">Social Media Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label>Twitter URL</Label>
                        <Input
                          value={footerData.social?.twitter || ''}
                          onChange={(e) => updateFooter('social.twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <Label>LinkedIn URL</Label>
                        <Input
                          value={footerData.social?.linkedin || ''}
                          onChange={(e) => updateFooter('social.linkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                        />
                      </div>
                      <div>
                        <Label>Facebook URL</Label>
                        <Input
                          value={footerData.social?.facebook || ''}
                          onChange={(e) => updateFooter('social.facebook', e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => saveSettings('main_footer', footerData, 'footer')} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Footer
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
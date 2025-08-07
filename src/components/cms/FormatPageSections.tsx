import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Image, Upload, X, FileText, Target, MapPin, Users, Clock } from 'lucide-react';

interface FormatPageSectionsProps {
  content: any;
  onUpdateContent: (content: any) => void;
  onOpenMediaLibrary: (section: string) => void;
  mediaFiles: any[];
}

export const FormatPageSections: React.FC<FormatPageSectionsProps> = ({
  content,
  onUpdateContent,
  onOpenMediaLibrary,
  mediaFiles
}) => {
  
  const updateSection = (sectionType: string, field: string, value: any) => {
    onUpdateContent({
      ...content,
      [sectionType]: {
        ...content[sectionType],
        [field]: value
      }
    });
  };

  const updateArray = (sectionType: string, index: number, field: string, value: any) => {
    const array = content[sectionType] || [];
    const updatedArray = [...array];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    onUpdateContent({
      ...content,
      [sectionType]: updatedArray
    });
  };

  const addToArray = (sectionType: string, item: any) => {
    const array = content[sectionType] || [];
    onUpdateContent({
      ...content,
      [sectionType]: [...array, item]
    });
  };

  const removeFromArray = (sectionType: string, index: number) => {
    const array = content[sectionType] || [];
    onUpdateContent({
      ...content,
      [sectionType]: array.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input
              id="hero_title"
              value={content.hero_title || ''}
              onChange={(e) => updateSection('hero', 'title', e.target.value)}
              placeholder="e.g., Digital 48 Sheet Billboards"
            />
          </div>
          
          <div>
            <Label htmlFor="hero_description">Hero Description</Label>
            <Textarea
              id="hero_description"
              value={content.hero_description || ''}
              onChange={(e) => updateSection('hero', 'description', e.target.value)}
              placeholder="Brief compelling description of the format"
              rows={3}
            />
          </div>

          <div>
            <Label>Hero Background Image</Label>
            <div className="flex items-center gap-2">
              <Input
                value={content.hero_image || ''}
                onChange={(e) => updateSection('hero', 'image', e.target.value)}
                placeholder="Image URL"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenMediaLibrary('hero_image')}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {content.hero_image && (
              <img 
                src={content.hero_image} 
                alt="Hero preview" 
                className="mt-2 w-32 h-20 object-cover rounded border"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={content.category || ''} onValueChange={(value) => onUpdateContent({...content, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Classic & Digital Roadside">Classic & Digital Roadside</SelectItem>
                  <SelectItem value="London Underground (TfL)">London Underground (TfL)</SelectItem>
                  <SelectItem value="Bus & Transport">Bus & Transport</SelectItem>
                  <SelectItem value="Street Furniture">Street Furniture</SelectItem>
                  <SelectItem value="Retail Advertising">Retail Advertising</SelectItem>
                  <SelectItem value="Lifestyle & Leisure">Lifestyle & Leisure</SelectItem>
                  <SelectItem value="Ambient / Guerrilla OOH">Ambient / Guerrilla OOH</SelectItem>
                  <SelectItem value="Digital OOH">Digital OOH</SelectItem>
                  <SelectItem value="Transit Advertising">Transit Advertising</SelectItem>
                  <SelectItem value="Programmatic DOOH (pDOOH)">Programmatic DOOH (pDOOH)</SelectItem>
                  {/* Legacy options for backwards compatibility */}
                  <SelectItem value="Billboard">Billboard</SelectItem>
                  <SelectItem value="Digital Billboard">Digital Billboard</SelectItem>
                  <SelectItem value="Tube">Tube</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={content.type || ''} onValueChange={(value) => updateSection('hero', 'type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Showcase Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Format Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="showcase_title">Showcase Title</Label>
            <Input
              id="showcase_title"
              value={content.showcase_title || ''}
              onChange={(e) => updateSection('showcase', 'title', e.target.value)}
              placeholder="e.g., See Digital 48 Sheet in Action"
            />
          </div>

          <div>
            <Label htmlFor="showcase_description">Showcase Description</Label>
            <Input
              id="showcase_description"
              value={content.showcase_description || ''}
              onChange={(e) => updateSection('showcase', 'description', e.target.value)}
              placeholder="e.g., Real examples across London"
            />
          </div>

          <div>
            <Label>Showcase Image</Label>
            <div className="flex items-center gap-2">
              <Input
                value={content.showcase_image || ''}
                onChange={(e) => updateSection('showcase', 'image', e.target.value)}
                placeholder="Image URL"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenMediaLibrary('showcase_image')}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {content.showcase_image && (
              <img 
                src={content.showcase_image} 
                alt="Showcase preview" 
                className="mt-2 w-32 h-20 object-cover rounded border"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* About Format Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            About This Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about_description">Main Description</Label>
            <Textarea
              id="about_description"
              value={content.about_description || ''}
              onChange={(e) => updateSection('about', 'description', e.target.value)}
              placeholder="Detailed description of what this format is"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="effectiveness">Effectiveness</Label>
            <Textarea
              id="effectiveness"
              value={content.effectiveness || ''}
              onChange={(e) => updateSection('about', 'effectiveness', e.target.value)}
              placeholder="Why this format is effective"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="physical_size">Physical Size</Label>
              <Input
                id="physical_size"
                value={content.physical_size || ''}
                onChange={(e) => updateSection('about', 'physical_size', e.target.value)}
                placeholder="e.g., 40ft x 10ft (12m x 3m)"
              />
            </div>
            <div>
              <Label htmlFor="placement">Placement</Label>
              <Input
                id="placement"
                value={content.placement || ''}
                onChange={(e) => updateSection('about', 'placement', e.target.value)}
                placeholder="e.g., Roadside, high visibility"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dwell_time">Dwell Time</Label>
            <Input
              id="dwell_time"
              value={content.dwell_time || ''}
              onChange={(e) => updateSection('about', 'dwell_time', e.target.value)}
              placeholder="e.g., 30-60 seconds (driving)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pricing & Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="price_range">Price Range</Label>
            <Input
              id="price_range"
              value={content.price_range || ''}
              onChange={(e) => updateSection('pricing', 'range', e.target.value)}
              placeholder="e.g., £2,000-£5,000 per 2 weeks"
            />
          </div>

          <div>
            <Label htmlFor="pricing_notes">Pricing Notes</Label>
            <Textarea
              id="pricing_notes"
              value={content.pricing_notes || ''}
              onChange={(e) => updateSection('pricing', 'notes', e.target.value)}
              placeholder="Additional pricing information"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coverage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            London Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="coverage_description">Coverage Description</Label>
            <Textarea
              id="coverage_description"
              value={content.coverage_description || ''}
              onChange={(e) => updateSection('coverage', 'description', e.target.value)}
              placeholder="Where this format is available in London"
              rows={3}
            />
          </div>

          <div>
            <Label>Available Networks</Label>
            <div className="space-y-2">
              {(content.networks || []).map((network: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={network}
                    onChange={(e) => updateArray('networks', index, 'name', e.target.value)}
                    placeholder="Network name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromArray('networks', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('networks', '')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Network
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Who Uses This Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Who Uses This Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(content.who_uses_it || []).map((use: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={use}
                  onChange={(e) => updateArray('who_uses_it', index, 'name', e.target.value)}
                  placeholder="e.g., Retail brands, Local businesses"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromArray('who_uses_it', index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addToArray('who_uses_it', '')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Use Case
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Custom Content Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(content.sections || []).map((section: any, index: number) => (
            <Card key={section.id || index} className="border-muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{section.type}</Badge>
                    <span className="text-sm font-medium">Section {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromArray('sections', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Section Type</Label>
                  <Select 
                    value={section.type || 'text'} 
                    onValueChange={(value) => updateArray('sections', index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="image">Image Only</SelectItem>
                      <SelectItem value="text_image">Text + Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={section.title || ''}
                    onChange={(e) => updateArray('sections', index, 'title', e.target.value)}
                    placeholder="Section title"
                  />
                </div>

                {(section.type === 'text' || section.type === 'text_image') && (
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={section.content || ''}
                      onChange={(e) => updateArray('sections', index, 'content', e.target.value)}
                      placeholder="Section content"
                      rows={4}
                    />
                  </div>
                )}

                {(section.type === 'image' || section.type === 'text_image' || section.type === 'video') && (
                  <div>
                    <Label>{section.type === 'video' ? 'Video URL' : 'Image URL'}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={section.image || ''}
                        onChange={(e) => updateArray('sections', index, 'image', e.target.value)}
                        placeholder={section.type === 'video' ? 'Video URL' : 'Image URL'}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onOpenMediaLibrary(`section_${index}`)}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {section.image && (
                      <img 
                        src={section.image} 
                        alt="Section preview" 
                        className="mt-2 w-32 h-20 object-cover rounded border"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => addToArray('sections', {
              id: Date.now().toString(),
              type: 'text',
              title: '',
              content: '',
              image: '',
              order: (content.sections?.length || 0) + 1
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Image Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(content.gallery || []).map((imageUrl: string, index: number) => (
              <div key={index} className="relative">
                <img 
                  src={imageUrl} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-24 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeFromArray('gallery', index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenMediaLibrary('gallery')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gallery Image
          </Button>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Call-to-Action Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cta_title">CTA Title</Label>
            <Input
              id="cta_title"
              value={content.cta_title || ''}
              onChange={(e) => updateSection('cta', 'title', e.target.value)}
              placeholder="e.g., Ready to Launch Your Campaign?"
            />
          </div>

          <div>
            <Label htmlFor="cta_description">CTA Description</Label>
            <Textarea
              id="cta_description"
              value={content.cta_description || ''}
              onChange={(e) => updateSection('cta', 'description', e.target.value)}
              placeholder="Supporting text for the CTA"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_primary_text">Primary Button Text</Label>
              <Input
                id="cta_primary_text"
                value={content.cta_primary_text || ''}
                onChange={(e) => updateSection('cta', 'primary_text', e.target.value)}
                placeholder="e.g., GET QUOTE"
              />
            </div>
            <div>
              <Label htmlFor="cta_primary_url">Primary Button URL</Label>
              <Input
                id="cta_primary_url"
                value={content.cta_primary_url || ''}
                onChange={(e) => updateSection('cta', 'primary_url', e.target.value)}
                placeholder="e.g., /quote"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_secondary_text">Secondary Button Text</Label>
              <Input
                id="cta_secondary_text"
                value={content.cta_secondary_text || ''}
                onChange={(e) => updateSection('cta', 'secondary_text', e.target.value)}
                placeholder="e.g., SPEAK TO PLANNER"
              />
            </div>
            <div>
              <Label htmlFor="cta_phone_number">Phone Number</Label>
              <Input
                id="cta_phone_number"
                value={content.cta_phone_number || ''}
                onChange={(e) => updateSection('cta', 'phone_number', e.target.value)}
                placeholder="e.g., +44 204 524 3019"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
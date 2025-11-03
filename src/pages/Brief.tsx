import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type FormData = {
  environment: string[];
  formats: string;
  market: string;
  goLiveDate: Date | undefined;
  campaignEndDate: Date | undefined;
  targetAudience: string[];
  budget: string;
  artworkStatus: string;
  campaignDuration: string;
  objectives: string[];
  mediaType: string;
  shareOfVoice: string;
  additionalNotes: string;
  name: string;
  email: string;
  phone: string;
  company: string;
};

// Chip selection component
const ChipGroup = ({ 
  options, 
  value, 
  onChange, 
  multiple = false 
}: { 
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}) => {
  const handleClick = (option: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(option)
        ? value.filter(v => v !== option)
        : [...value, option];
      onChange(newValue);
    } else {
      onChange(option);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = Array.isArray(value) 
          ? value.includes(option)
          : value === option;
        
        return (
          <Badge
            key={option}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
            onClick={() => handleClick(option)}
          >
            {option}
          </Badge>
        );
      })}
    </div>
  );
};

export default function Brief() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [customAudience, setCustomAudience] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    environment: [],
    formats: '',
    market: '',
    goLiveDate: undefined,
    campaignEndDate: undefined,
    targetAudience: [],
    budget: '',
    artworkStatus: '',
    campaignDuration: '',
    objectives: [],
    mediaType: '',
    shareOfVoice: '',
    additionalNotes: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Set environment options (hardcoded - replace with Supabase query if you have an environments table)
  useEffect(() => {
    setEnvironments([
      "Roadside",
      "Rail",
      "Bus",
      "Taxi",
      "Airport",
      "Underground",
      "Metro",
      "Motorway",
      "Forecourt",
      "Petrol Station",
      "Shopping Mall",
      "Supermarket",
      "Retail Park",
      "City Centre",
      "Urban",
      "Leisure",
      "Cinema",
      "Gym",
      "Sports Stadium",
      "Retail",
      "Education",
      "Corporate",
      "Experiential",
      "Event"
    ]);
  }, []);

  const formatOptions = ["Static", "Digital", "Both"];
  
  const marketOptions = [
    "London",
    "New York",
    "Dubai",
    "Paris",
    "Tokyo",
    "Sydney",
    "Singapore",
    "Hong Kong"
  ];

  const targetAudienceOptions = [
    "Families",
    "Commuters", 
    "Young Professionals",
    "Students",
    "Travellers",
    "Business Decision-Makers"
  ];

  const artworkStatusOptions = ["Yes — ready to upload", "In development", "Need creative support"];

  const objectiveOptions = [
    "Brand Awareness",
    "Lead Generation",
    "Product Launch",
    "Event Promotion",
    "Seasonal Campaign",
    "Other"
  ];

  const mediaTypeOptions = ["Roadside", "Transit", "Retail", "Mixed"];
  
  const shareOfVoiceOptions = [
    { value: "100%", label: "100% - Maximum Impact" },
    { value: "50%", label: "50% - High Visibility" },
    { value: "25%", label: "25% - Moderate Presence" },
    { value: "No Preference", label: "No Preference" }
  ];

  const steps = [
    { id: 'market', title: "Where do you want your brand to be seen?", required: true },
    { id: 'environment', title: "What environments are you interested in?", required: true },
    { id: 'format', title: "What format do you prefer?", required: true },
    { id: 'startDate', title: "When do you want your campaign to start?", required: false },
    { id: 'endDate', title: "When do you want your campaign to end?", required: false },
    { id: 'audience', title: "Who are you trying to reach?", required: false },
    { id: 'budget', title: "What's your budget for this campaign?", required: true },
    { id: 'artwork', title: "Do you have artwork ready?", required: false },
    { id: 'contact', title: "Who should we send your options to?", required: true },
    { id: 'review', title: `Perfect, ${formData.name.split(' ')[0] || 'there'} - we are on it!`, required: true }
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    
    switch(step.id) {
      case 'market': 
        return formData.market !== '';
      case 'environment': 
        return formData.environment.length > 0;
      case 'format': 
        return formData.formats !== '';
      case 'startDate': 
        return true; // Optional
      case 'endDate': 
        return true; // Optional
      case 'audience': 
        return true; // Optional
      case 'budget': 
        return formData.budget.trim() !== '';
      case 'artwork': 
        return true; // Optional
      case 'objectives': 
        return true; // Optional
      case 'mediaType': 
        return true; // Optional
      case 'shareOfVoice': 
        return true; // Optional
      case 'notes': 
        return true; // Optional
      case 'contact': 
        return formData.name.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.email.includes('@') &&
               formData.company.trim() !== '';
      case 'review':
        return true; // Always can proceed from review
      default: 
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    try {
      // Prepare submission data for the edge function
      const nameParts = formData.name.trim().split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || firstname;

      const briefData = {
        firstname,
        lastname,
        email: formData.email,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : 'N/A',
        company: formData.company,
        budget_band: formData.budget,
        objective: formData.objectives.length > 0 ? formData.objectives.join(', ') : 'General campaign',
        target_areas: formData.market ? [formData.market] : [],
        formats: formData.environment,
        start_month: formData.goLiveDate ? format(formData.goLiveDate, 'yyyy-MM-dd') : null,
        creative_status: formData.artworkStatus && formData.artworkStatus.trim() !== '' ? formData.artworkStatus : 'Not specified',
        notes: [
          formData.additionalNotes,
          formData.formats ? `Format preference: ${formData.formats}` : '',
          formData.campaignEndDate ? `End date: ${format(formData.campaignEndDate, 'yyyy-MM-dd')}` : '',
          formData.targetAudience.length > 0 ? `Target audience: ${formData.targetAudience.join(', ')}` : '',
          formData.campaignDuration ? `Duration: ${formData.campaignDuration}` : '',
          formData.mediaType ? `Media type: ${formData.mediaType}` : '',
          formData.shareOfVoice ? `Share of voice: ${formData.shareOfVoice}` : ''
        ].filter(Boolean).join('\n'),
        source_path: window.location.pathname,
        mbl: true
      };

      // Submit to edge function
      const { data, error } = await supabase.functions.invoke('submit-brief', {
        body: briefData
      });

      console.log('submit-brief response', {
        ok: data && (data as any).ok,
        hasError: !!error,
      });

      if (error) throw new Error(error.message || 'Submission failed');
      if (data && (data as any).ok === false) throw new Error((data as any).error || 'Submission failed');

      toast.success('Brief submitted successfully!');

      // Build thank-you URL with summary params
      const params = new URLSearchParams({
        firstname,
        budget: briefData.budget_band || '',
        objective: briefData.objective || '',
        target_areas: (briefData.target_areas || []).join(','),
        formats: (briefData.formats || []).join(','),
        start_month: briefData.start_month || '',
        end_month: formData.campaignEndDate ? format(formData.campaignEndDate, 'yyyy-MM-dd') : '',
        creative_status: briefData.creative_status || '',
        notes: briefData.notes || '',
        market: formData.market || '',
        audience: formData.targetAudience.join(', ') || '',
        format_preference: formData.formats || ''
      });

      console.log('Submitting with dates:', {
        goLiveDate: formData.goLiveDate,
        campaignEndDate: formData.campaignEndDate,
        start_month: briefData.start_month,
        end_month: formData.campaignEndDate ? format(formData.campaignEndDate, 'yyyy-MM-dd') : ''
      });

      // Navigate first so data shows on the final screen
      navigate(`/thank-you?${params.toString()}`);

      // Then reset state
      setFormData({
        environment: [],
        formats: '',
        market: '',
        goLiveDate: undefined,
        campaignEndDate: undefined,
        targetAudience: [],
        budget: '',
        artworkStatus: '',
        campaignDuration: '',
        objectives: [],
        mediaType: '',
        shareOfVoice: '',
        additionalNotes: '',
        name: '',
        email: '',
        phone: '',
        company: ''
      });
      
      setCurrentStep(0);
      setStartDateInput('');
      setEndDateInput('');
    } catch (error: any) {
      console.error('Error submitting brief:', error);
      toast.error(error?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch(step.id) {
      case 'market':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              value={formData.market}
              onChange={(e) => setFormData({...formData, market: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && formData.market.trim()) {
                  toast.success(`${formData.market} saved!`);
                }
              }}
              placeholder="Type a city or region... then hit Enter"
              className="text-lg"
            />
            <ChipGroup
              options={marketOptions}
              value={formData.market}
              onChange={(value) => {
                setFormData({...formData, market: value as string});
                toast.success(`${value} selected!`);
              }}
              multiple={false}
            />
          </div>
        );
      
      case 'environment':
        return (
          <div className="grid grid-cols-3 gap-3">
            {environments.map((env) => {
              const isSelected = formData.environment.includes(env);
              return (
                <Badge
                  key={env}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-4 py-6 text-sm hover:opacity-80 transition-opacity justify-center text-center h-auto"
                  onClick={() => {
                    const newValue = isSelected
                      ? formData.environment.filter(e => e !== env)
                      : [...formData.environment, env];
                    setFormData({...formData, environment: newValue});
                  }}
                >
                  {env}
                </Badge>
              );
            })}
          </div>
        );
      
      case 'format':
        return (
          <ChipGroup
            options={formatOptions}
            value={formData.formats}
            onChange={(value) => setFormData({...formData, formats: value as string})}
            multiple={false}
          />
        );
      
      case 'startDate':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Input
                type="text"
                inputMode="numeric"
                value={startDateInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDateInput(value);
                  
                  // Try to parse date from DD/MM/YYYY format
                  const parts = value.split('/');
                  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
                      const date = new Date(year, month, day);
                      setFormData({...formData, goLiveDate: date});
                      console.log('Start date set:', date);
                    }
                  }
                }}
                placeholder="DD/MM/YYYY"
                className="text-4xl text-center font-normal border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter the start date for your campaign (e.g., 15/12/2025)
              </p>
              {formData.goLiveDate && (
                <p className="text-sm text-primary mt-2">
                  ✓ {format(formData.goLiveDate, 'dd MMMM yyyy')}
                </p>
              )}
            </div>
          </div>
        );
      
      case 'endDate':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Input
                type="text"
                inputMode="numeric"
                value={endDateInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setEndDateInput(value);
                  
                  // Try to parse date from DD/MM/YYYY format
                  const parts = value.split('/');
                  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
                      const date = new Date(year, month, day);
                      setFormData({...formData, campaignEndDate: date});
                      console.log('End date set:', date);
                    }
                  }
                }}
                placeholder="DD/MM/YYYY"
                className="text-4xl text-center font-normal border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter the end date for your campaign (e.g., 15/01/2026)
              </p>
              {formData.campaignEndDate && (
                <p className="text-sm text-primary mt-2">
                  ✓ {format(formData.campaignEndDate, 'dd MMMM yyyy')}
                </p>
              )}
            </div>
          </div>
        );
      
      case 'audience':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Tell us who your primary target audiences are (We use Experian Mosaic)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {targetAudienceOptions.map((audience) => {
                const isSelected = formData.targetAudience.includes(audience);
                return (
                  <Badge
                    key={audience}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer px-4 py-6 text-sm hover:opacity-80 transition-opacity justify-center text-center h-auto"
                    onClick={() => {
                      const newValue = isSelected
                        ? formData.targetAudience.filter(a => a !== audience)
                        : [...formData.targetAudience, audience];
                      setFormData({...formData, targetAudience: newValue});
                    }}
                  >
                    {audience}
                  </Badge>
                );
              })}
            </div>
            <div className="text-center">
              <Input
                type="text"
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAudience.trim()) {
                    setFormData({
                      ...formData, 
                      targetAudience: [...formData.targetAudience, customAudience.trim()]
                    });
                    setCustomAudience('');
                  }
                }}
                placeholder="Or type your audience... then hit Enter"
                className="text-sm text-center border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
        );
      
      case 'budget':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl font-bold text-primary">£</span>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.budget}
                onChange={(e) => {
                  // Allow only numbers and commas
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  setFormData({...formData, budget: value});
                }}
                placeholder="Enter your total budget"
                className="text-2xl text-center max-w-md"
              />
            </div>
          </div>
        );
      
      case 'artwork':
        return (
          <div className="flex justify-center gap-4">
            {artworkStatusOptions.map((status) => (
              <Badge
                key={status}
                variant={formData.artworkStatus === status ? "default" : "outline"}
                className="cursor-pointer px-6 py-6 text-sm hover:opacity-80 transition-opacity text-center"
                onClick={() => setFormData({...formData, artworkStatus: status})}
              >
                {status}
              </Badge>
            ))}
          </div>
        );
      
      case 'objectives':
        return (
          <ChipGroup
            options={objectiveOptions}
            value={formData.objectives}
            onChange={(value) => setFormData({...formData, objectives: value as string[]})}
            multiple={true}
          />
        );
      
      case 'mediaType':
        return (
          <ChipGroup
            options={mediaTypeOptions}
            value={formData.mediaType}
            onChange={(value) => setFormData({...formData, mediaType: value as string})}
            multiple={false}
          />
        );
      
      case 'shareOfVoice':
        return (
          <div className="space-y-3">
            {shareOfVoiceOptions.map((option) => (
              <Badge
                key={option.value}
                variant={formData.shareOfVoice === option.value ? "default" : "outline"}
                className="w-full cursor-pointer px-4 py-3 text-sm justify-center hover:opacity-80 transition-opacity"
                onClick={() => setFormData({...formData, shareOfVoice: option.value})}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        );
      
      case 'notes':
        return (
          <Textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
            placeholder="Any additional campaign details..."
            className="text-lg min-h-32"
          />
        );
      
      case 'contact':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Your name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Jane Doe"
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Brand / company</label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Brand name"
                  className="text-base"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="you@company.com"
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone (optional)</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+44 7..."
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Anything else we should know? (optional)</label>
              <Textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                placeholder="Timing nuances, must-have sites, compliance notes..."
                className="text-base min-h-24"
              />
            </div>
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <p className="text-base text-muted-foreground text-center">
              Our trading desk will now source your off-market options. Expect a shortlist within 24 hours.
            </p>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Locations</p>
                    <p className="text-base">{formData.market || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                    <p className="text-base">{formData.goLiveDate ? format(formData.goLiveDate, 'dd/MM/yyyy') : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">End Date</p>
                    <p className="text-base">{formData.campaignEndDate ? format(formData.campaignEndDate, 'dd/MM/yyyy') : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Audience</p>
                    <p className="text-base">{formData.targetAudience.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Environments</p>
                    <p className="text-base">{formData.environment.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Format Preference</p>
                    <p className="text-base">{formData.formats || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="text-base">£{formData.budget || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Creative</p>
                    <p className="text-base">{formData.artworkStatus || 'Not specified'}</p>
                  </div>
                  {formData.additionalNotes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-base">{formData.additionalNotes}</p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Contact</p>
                    <p className="text-base font-medium">{formData.name} — {formData.company}</p>
                    <p className="text-sm text-muted-foreground">{formData.email} · {formData.phone || 'No phone'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm text-muted-foreground">
                    Fast-Track Deal Finder (priority sourcing)
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's find your perfect campaign.</h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                {steps[currentStep].title}
              </h2>
              <div className="min-h-[200px]">
                {renderStep()}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className="w-32"
              >
                Back
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="w-40"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Brief'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="w-32"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

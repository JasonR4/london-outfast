import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// HubSpot Configuration - UPDATE THESE WITH YOUR PORTAL/FORM IDs
const HUBSPOT_PORTAL_ID = "YOUR_PORTAL_ID";
const HUBSPOT_FORM_ID = "YOUR_FORM_ID";

type FormData = {
  environment: string;
  format: string;
  market: string;
  goLiveDate: Date | undefined;
  campaignDuration: string;
  budgetMin: number;
  budgetMax: number;
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
  name, 
  options, 
  value, 
  onChange, 
  multiple = false 
}: { 
  name: string;
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
  
  const [formData, setFormData] = useState<FormData>({
    environment: '',
    format: '',
    market: '',
    goLiveDate: undefined,
    campaignDuration: '',
    budgetMin: 0,
    budgetMax: 150000,
    objectives: [],
    mediaType: '',
    shareOfVoice: '',
    additionalNotes: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Fetch environments from Supabase or use hardcoded list
  useEffect(() => {
    // TODO: Replace with actual Supabase query if you have an environments table
    // For now, using hardcoded options
    setEnvironments([
      "Premium Digital Billboard",
      "Bus Shelters",
      "London Underground",
      "Rail Stations",
      "Shopping Malls",
      "Airport Advertising",
      "Street Furniture",
      "Taxi Advertising"
    ]);
  }, []);

  const formatOptions = ["Static", "Digital", "Both"];
  
  const marketOptions = [
    "London",
    "Birmingham",
    "Manchester",
    "Edinburgh",
    "Glasgow",
    "Liverpool",
    "Bristol",
    "Leeds",
    "Sheffield",
    "UK Cities"
  ];

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
    { id: 'environment', title: "Which environment are you interested in?", required: true },
    { id: 'format', title: "What format do you prefer?", required: true },
    { id: 'market', title: "Which market are you targeting?", required: true },
    { id: 'timing', title: "When do you need to go live?", required: false },
    { id: 'budget', title: "What's your budget range?", required: true },
    { id: 'objectives', title: "What are your campaign objectives?", required: false },
    { id: 'mediaType', title: "Media type preference?", required: false },
    { id: 'shareOfVoice', title: "What share of voice do you need?", required: false },
    { id: 'notes', title: "Any additional notes?", required: false },
    { id: 'contact', title: "Let's get your contact details", required: true }
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    
    switch(step.id) {
      case 'environment': return formData.environment !== '';
      case 'format': return formData.format !== '';
      case 'market': return formData.market !== '';
      case 'timing': return true; // Optional
      case 'budget': return formData.budgetMin >= 0 && formData.budgetMax > formData.budgetMin;
      case 'objectives': return true; // Optional
      case 'mediaType': return true; // Optional
      case 'shareOfVoice': return true; // Optional
      case 'notes': return true; // Optional
      case 'contact': 
        return formData.name.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.email.includes('@') &&
               formData.phone.trim() !== '';
      default: return false;
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
      // Get HubSpot tracking cookie
      const hubspotCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('hubspotutk='))
        ?.split('=')[1];

      // Prepare HubSpot submission
      const hubspotData = {
        fields: [
          { name: "environment", value: formData.environment },
          { name: "format", value: formData.format },
          { name: "market", value: formData.market },
          { name: "go_live_date", value: formData.goLiveDate ? format(formData.goLiveDate, 'yyyy-MM-dd') : '' },
          { name: "campaign_duration", value: formData.campaignDuration },
          { name: "budget_min", value: formData.budgetMin.toString() },
          { name: "budget_max", value: formData.budgetMax.toString() },
          { name: "objectives", value: formData.objectives.join(', ') },
          { name: "media_type", value: formData.mediaType },
          { name: "share_of_voice", value: formData.shareOfVoice },
          { name: "additional_notes", value: formData.additionalNotes },
          { name: "firstname", value: formData.name.split(' ')[0] },
          { name: "lastname", value: formData.name.split(' ').slice(1).join(' ') || formData.name },
          { name: "email", value: formData.email },
          { name: "phone", value: formData.phone },
          { name: "company", value: formData.company }
        ],
        context: {
          hutk: hubspotCookie,
          pageUri: window.location.href,
          pageName: document.title
        }
      };

      // Submit to HubSpot
      const response = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hubspotData)
        }
      );

      if (!response.ok) {
        throw new Error('HubSpot submission failed');
      }

      toast.success('Deal finder submitted successfully!');
      
      // Reset form
      setFormData({
        environment: '',
        format: '',
        market: '',
        goLiveDate: undefined,
        campaignDuration: '',
        budgetMin: 0,
        budgetMax: 150000,
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
      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting deal finder:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch(step.id) {
      case 'environment':
        return (
          <div className="space-y-4">
            <ChipGroup
              name="environment"
              options={environments}
              value={formData.environment}
              onChange={(value) => setFormData({...formData, environment: value as string})}
              multiple={false}
            />
          </div>
        );
      
      case 'format':
        return (
          <div className="space-y-4">
            <ChipGroup
              name="format"
              options={formatOptions}
              value={formData.format}
              onChange={(value) => setFormData({...formData, format: value as string})}
              multiple={false}
            />
          </div>
        );
      
      case 'market':
        return (
          <div className="space-y-4">
            <Select value={formData.market} onValueChange={(value) => setFormData({...formData, market: value})}>
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Select a market" />
              </SelectTrigger>
              <SelectContent>
                {marketOptions.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'timing':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Go Live Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.goLiveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.goLiveDate ? format(formData.goLiveDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.goLiveDate}
                    onSelect={(date) => setFormData({...formData, goLiveDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Duration</label>
              <Input
                type="text"
                value={formData.campaignDuration}
                onChange={(e) => setFormData({...formData, campaignDuration: e.target.value})}
                placeholder="e.g., 2 weeks, 1 month, 3 months"
                className="text-lg"
              />
            </div>
          </div>
        );
      
      case 'budget':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-3xl font-bold">
                £{formData.budgetMin.toLocaleString()} - £{formData.budgetMax.toLocaleString()}
              </p>
            </div>
            <Slider
              min={0}
              max={150000}
              step={1000}
              value={[formData.budgetMin, formData.budgetMax]}
              onValueChange={([min, max]) => setFormData({...formData, budgetMin: min, budgetMax: max})}
              className="w-full"
            />
          </div>
        );
      
      case 'objectives':
        return (
          <div className="space-y-4">
            <ChipGroup
              name="objectives"
              options={objectiveOptions}
              value={formData.objectives}
              onChange={(value) => setFormData({...formData, objectives: value as string[]})}
              multiple={true}
            />
          </div>
        );
      
      case 'mediaType':
        return (
          <div className="space-y-4">
            <ChipGroup
              name="mediaType"
              options={mediaTypeOptions}
              value={formData.mediaType}
              onChange={(value) => setFormData({...formData, mediaType: value as string})}
              multiple={false}
            />
          </div>
        );
      
      case 'shareOfVoice':
        return (
          <div className="space-y-4">
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
          <div className="space-y-4">
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
              placeholder="Any additional campaign details..."
              className="text-lg min-h-32"
            />
          </div>
        );
      
      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your full name"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="your.email@company.com"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+44 20 1234 5678"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Your company name"
                className="text-lg"
              />
            </div>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Deal Finder</h1>
          <p className="text-xl opacity-90 mb-6">
            Find your perfect OOH advertising deal in minutes
          </p>
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
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="w-32"
              >
                Back
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="w-32"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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

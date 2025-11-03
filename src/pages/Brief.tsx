import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { oohFormats } from "@/data/oohFormats";
import { trackBriefFormSubmitted } from "@/utils/analytics";

const objectives = [
  "Brand awareness",
  "Store visits",
  "Lead generation",
  "Website traffic",
  "App installs",
  "Product launch",
  "Event promotion",
  "Recruitment",
  "Geo domination",
  "Retargeting",
  "Seasonal",
  "PR launch",
  "Directional",
  "Education",
  "Other",
] as const;

const creativeStatuses = ["Ready", "Need design", "Unsure"] as const;

const HARDCODED_FORMAT_CATEGORIES = [
  'Classic & Digital Roadside',
  'London Underground (TfL)',
  'National Rail & Commuter Rail',
  'Bus Advertising',
  'Taxi Advertising',
  'Retail & Leisure Environments',
  'Airports',
  'Street Furniture',
  'Programmatic DOOH (pDOOH)',
  'Ambient / Guerrilla OOH',
] as const;

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  jobtitle: string;
  budget_band: string;
  objective: string;
  objective_other?: string;
  target_areas: string[];
  formats: string[];
  start_month: string;
  creative_status: string;
  notes: string;
  consent: boolean;
};

// Chip selection component
const ChipGroup = ({ 
  options, 
  selected, 
  onChange, 
  multi = true 
}: { 
  options: readonly string[] | string[]; 
  selected: string | string[]; 
  onChange: (val: string | string[]) => void;
  multi?: boolean;
}) => {
  const handleClick = (opt: string) => {
    if (multi) {
      const arr = Array.isArray(selected) ? selected : [];
      const newVal = arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt];
      onChange(newVal);
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi 
          ? (Array.isArray(selected) && selected.includes(opt))
          : selected === opt;
        return (
          <Badge
            key={opt}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            onClick={() => handleClick(opt)}
          >
            {opt}
          </Badge>
        );
      })}
    </div>
  );
};

export default function Brief() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    jobtitle: '',
    budget_band: '',
    objective: '',
    objective_other: '',
    target_areas: [],
    formats: [],
    start_month: '',
    creative_status: '',
    notes: '',
    consent: false,
  });

  const [formatSearch, setFormatSearch] = useState('');
  const [formatCategory, setFormatCategory] = useState<string>('all');

  const filteredFormatNames = useMemo(() => {
    const q = formatSearch.trim().toLowerCase();
    return oohFormats
      .filter(f => formatCategory === 'all' || f.category === formatCategory)
      .filter(f => !q || f.name.toLowerCase().includes(q) || f.shortName?.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
      .map(f => f.shortName || f.name);
  }, [formatCategory, formatSearch]);

  // Extract UTM and source_path
  const utm = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return {
      source_path: location.pathname + location.search,
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_term: p.get('utm_term') || undefined,
      utm_content: p.get('utm_content') || undefined,
    }
  }, [location.pathname, location.search]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('🔥 Form submission started with values:', formData);
    try {
      const firstName = (formData.firstname || '').trim() || 'there';
      toast({
        title: 'Submitting brief',
        description: `Hang tight, ${firstName} — this takes a few seconds.`,
        duration: 7000,
      });
      
      const objectiveFinal = formData.objective === 'Other' && formData.objective_other?.trim()
        ? `Other: ${formData.objective_other.trim()}`
        : formData.objective;
      
      const { objective_other, consent, ...rest } = formData;
      const payload = {
        ...rest,
        objective: objectiveFinal,
        ...utm,
        mbl: true,
        start_month: formData.start_month ? `${formData.start_month}` : undefined,
      };
      
      const { data, error } = await supabase.functions.invoke('submit-brief', { body: payload });
      if (error || !data?.ok) throw new Error(error?.message || data?.error || 'Failed to submit');
      
      const extractBudgetValue = (budgetString: string | number): number => {
        if (typeof budgetString === 'number') return budgetString;
        const str = String(budgetString || '');
        const numbers = str.match(/[\d,]+/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
        if (numbers.length === 0) return 5000;
        if (numbers.length === 1) return numbers[0];
        return Math.round((Math.min(...numbers) + Math.max(...numbers)) / 2);
      };
      
      const budget = extractBudgetValue(formData.budget_band);
      trackBriefFormSubmitted({
        plan_value: budget,
        formats_count: formData.formats?.length || 0,
        location: "London"
      });
      
      toast({ title: 'Brief sent', description: "We'll call you shortly." });
      
      const thankYouUrl = `/thank-you?brief=1` +
        `&firstname=${encodeURIComponent(formData.firstname)}` +
        `&budget=${encodeURIComponent(formData.budget_band)}` +
        `&objective=${encodeURIComponent(objectiveFinal)}` +
        `&target_areas=${encodeURIComponent(formData.target_areas.join(','))}` +
        `&formats=${encodeURIComponent(formData.formats.join(','))}` +
        `&start_month=${encodeURIComponent(formData.start_month || '')}` +
        `&creative_status=${encodeURIComponent(formData.creative_status)}` +
        (formData.notes ? `&notes=${encodeURIComponent(formData.notes)}` : '');
      
      navigate(thankYouUrl);
    } catch (e: any) {
      toast({ title: 'Submission failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-question-at-a-time steps
  const steps = useMemo(() => {
    const base = [
      { id: 'firstname', title: 'What is your first name?' },
      { id: 'lastname', title: 'And your last name?' },
      { id: 'email', title: 'What is your work email?' },
      { id: 'phone', title: 'What number can we call?' },
      { id: 'company', title: 'What’s your company?' },
      { id: 'website', title: 'Your website?' },
      { id: 'jobtitle', title: 'Your role?' },
      { id: 'budget_band', title: 'What’s your budget (GBP)?' },
      { id: 'objective', title: 'What’s your primary objective?' },
      ...(formData.objective === 'Other' ? [{ id: 'objective_other', title: 'Please specify your objective' }] : []),
      { id: 'target_areas', title: 'Choose your target areas' },
      { id: 'formats', title: 'Which formats interest you?' },
      { id: 'start_month', title: 'Earliest start month?' },
      { id: 'creative_status', title: 'Do you have creative ready?' },
      { id: 'notes', title: 'Any additional requirements?' },
      { id: 'consent', title: 'Consent' },
    ];
    return base;
  }, [formData.objective]);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    const step = steps[currentStep]?.id;
    switch (step) {
      case 'firstname': return !!formData.firstname;
      case 'lastname': return !!formData.lastname;
      case 'email': return !!formData.email;
      case 'phone': return !!formData.phone;
      case 'company': return !!formData.company;
      case 'website': return !!formData.website;
      case 'jobtitle': return !!formData.jobtitle;
      case 'budget_band': return !!formData.budget_band;
      case 'objective': return !!formData.objective;
      case 'objective_other': return !!formData.objective_other;
      case 'target_areas': return formData.target_areas.length > 0;
      case 'formats': return formData.formats.length > 0;
      case 'start_month': return !!formData.start_month;
      case 'creative_status': return !!formData.creative_status;
      case 'notes': return !!formData.notes;
      case 'consent': return !!formData.consent;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast({ title: 'Required field', description: 'Please complete this step before continuing.', variant: 'destructive' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => { document.title = 'Talk to a Specialist | Media Buying London' }, []);

  const renderStep = () => {
    const step = steps[currentStep];
    const id = step.id as string;

    switch (id) {
      case 'firstname':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Jane"
              value={formData.firstname}
              onChange={(e) => updateField('firstname', e.target.value)}
              autoComplete="given-name"
            />
          </div>
        );
      case 'lastname':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Doe"
              value={formData.lastname}
              onChange={(e) => updateField('lastname', e.target.value)}
              autoComplete="family-name"
            />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              autoComplete="email"
            />
          </div>
        );
      case 'phone':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              type="tel"
              placeholder="07..."
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              autoComplete="tel"
            />
          </div>
        );
      case 'company':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Acme Ltd"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              autoComplete="organization"
            />
          </div>
        );
      case 'website':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              type="url"
              placeholder="https://... or company.com"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              autoComplete="url"
            />
          </div>
        );
      case 'jobtitle':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Marketing Manager"
              value={formData.jobtitle}
              onChange={(e) => updateField('jobtitle', e.target.value)}
              autoComplete="organization-title"
            />
          </div>
        );
      case 'budget_band':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Enter amount e.g. 15000"
              inputMode="numeric"
              value={formData.budget_band}
              onChange={(e) => updateField('budget_band', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Numbers only; we'll interpret this as GBP</p>
          </div>
        );
      case 'objective':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <ChipGroup
              options={objectives}
              selected={formData.objective}
              onChange={(val) => updateField('objective', val)}
              multi={false}
            />
          </div>
        );
      case 'objective_other':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              placeholder="Describe your objective"
              value={formData.objective_other || ''}
              onChange={(e) => updateField('objective_other', e.target.value)}
            />
          </div>
        );
      case 'target_areas':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <LocationSelector
              selectedLocations={formData.target_areas}
              onSelectionChange={(locs) => updateField('target_areas', locs)}
              title="London Areas"
              description="Select your London areas."
              showSelectedSummary
              maxHeight="400px"
            />
          </div>
        );
      case 'formats':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Search formats..."
                value={formatSearch}
                onChange={(e) => setFormatSearch(e.target.value)}
              />
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formatCategory}
                onChange={(e) => setFormatCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {HARDCODED_FORMAT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 max-h-96 overflow-auto border rounded-md p-4">
              <label className="flex items-center gap-2 text-sm border-b pb-2 mb-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={formData.formats.includes('Open to recommendations')}
                  onChange={(e) => {
                    const current = new Set(formData.formats);
                    if (e.target.checked) current.add('Open to recommendations');
                    else current.delete('Open to recommendations');
                    updateField('formats', Array.from(current));
                  }}
                />
                <span className="font-medium text-primary">Open to recommendations</span>
              </label>
              {filteredFormatNames.map((name) => (
                <label key={name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={formData.formats.includes(name)}
                    onChange={(e) => {
                      const current = new Set(formData.formats);
                      if (e.target.checked) current.add(name);
                      else current.delete(name);
                      updateField('formats', Array.from(current));
                    }}
                  />
                  <span>{name}</span>
                </label>
              ))}
              {filteredFormatNames.length === 0 && (
                <p className="text-sm text-muted-foreground">No formats found.</p>
              )}
            </div>
          </div>
        );
      case 'start_month':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Input
              type="month"
              value={formData.start_month}
              onChange={(e) => updateField('start_month', e.target.value)}
            />
          </div>
        );
      case 'creative_status':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <ChipGroup
              options={creativeStatuses}
              selected={formData.creative_status}
              onChange={(val) => updateField('creative_status', val)}
              multi={false}
            />
          </div>
        );
      case 'notes':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <Textarea
              placeholder="Tell us about your campaign, audience, specific requirements..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={6}
            />
          </div>
        );
      case 'consent':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <input
                type="checkbox"
                className="mt-1 rounded"
                checked={formData.consent}
                onChange={(e) => updateField('consent', e.target.checked)}
              />
              <span className="text-sm">
                I consent to Media Buying London contacting me about this brief and storing my details according to their privacy policy. *
              </span>
            </label>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Your brief is ready to submit!</span>
              </div>
              <p className="text-sm text-muted-foreground">We'll review your brief and call you within 24 hours</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Talk to a Specialist</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Prefer the phone? Call <a href="tel:+442045243019" className="text-primary hover:underline font-medium">020 4524 3019</a> now. 
            Or send a quick brief and we'll call you back fast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="outline">
              <a href="tel:+442045243019">Call now</a>
            </Button>
            <Button 
              size="lg"
              onClick={() => {
                const el = document.getElementById('brief-form');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Send brief
            </Button>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="brief-form" className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="bg-card border rounded-lg p-6 sm:p-8 mb-6">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 gap-2"
              disabled={isSubmitting || !canProceed()}
            >
              {currentStep === totalSteps - 1 ? (
                isSubmitting ? 'Submitting...' : 'Submit brief'
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

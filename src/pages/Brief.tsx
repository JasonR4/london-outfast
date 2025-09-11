import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
const schema = z.object({
  firstname: z.string().min(1, "Required"),
  lastname: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Required").regex(/^[+0-9().\-\s]+$/, "Use a valid phone number"),
  company: z.string().min(1, "Required"),
  website: z.string().min(1, "Required"),
  jobtitle: z.string().min(1, "Required"),
  budget_band: z.string().min(1, "Required"),
  objective: z.enum(objectives),
  objective_other: z.string().optional(),
  target_areas: z.array(z.string()).min(1, "Select at least one area"),
  formats: z.array(z.string()).min(1, "Select at least one format"),
  start_month: z.string().min(1, "Required"), // YYYY-MM
  creative_status: z.enum(creativeStatuses),
  notes: z.string().min(1, "Required"),
  consent: z.boolean().refine(v => v, { message: "Consent is required" }),
  hp: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.objective === "Other" && (!val.objective_other || !val.objective_other.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["objective_other"], message: "Please specify your objective" });
  }
});

type FormValues = z.infer<typeof schema>;

export default function Brief() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    shouldUnregister: false,
defaultValues: {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  company: '',
  website: '',
  jobtitle: '',
  notes: '',
  start_month: '',
  target_areas: [],
  formats: [],
  objective_other: '',
  consent: false,
}
  });

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

// Media formats: hardcoded categories + local dataset
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

const [formatSearch, setFormatSearch] = useState('');
const [formatCategory, setFormatCategory] = useState<string | 'all'>('all');

const filteredFormatNames = useMemo(() => {
  const q = formatSearch.trim().toLowerCase();
  return oohFormats
    .filter(f => formatCategory === 'all' || f.category === formatCategory)
    .filter(f => !q || f.name.toLowerCase().includes(q) || f.shortName.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
    .map(f => f.shortName || f.name);
}, [formatCategory, formatSearch]);

const objectiveValue = form.watch('objective');
const onSubmit = async (values: FormValues) => {
  console.log('🔥 Form submission started with values:', values);
  try {
    // Immediate feedback while the Edge Function runs
    const firstName = (values.firstname || '').trim() || 'there';
    toast({
      title: 'Submitting brief',
      description: `Hang tight, ${firstName} — this takes a few seconds.`,
      duration: 7000,
    });
    const objectiveFinal = values.objective === 'Other' && values.objective_other?.trim()
      ? `Other: ${values.objective_other.trim()}`
      : values.objective;
    const { objective_other, ...rest } = values as any;
    const payload = {
      ...rest,
      objective: objectiveFinal,
      ...utm,
      mbl: true,
      // normalise month to YYYY-MM where possible
      start_month: values.start_month ? `${values.start_month}` : undefined,
    };
    const { data, error } = await supabase.functions.invoke('submit-brief', { body: payload });
    if (error || !data?.ok) throw new Error(error?.message || data?.error || 'Failed to submit');
    
    // Track brief form submission with numeric budget
    const extractBudgetValue = (budgetString: string | number): number => {
      if (typeof budgetString === 'number') return budgetString;
      
      // Convert string like "£10,000-£20,000" or "£15,000+" to numeric value
      const str = String(budgetString || '');
      
      // Extract all numbers from the string (handles £10,000-£20,000)
      const numbers = str.match(/[\d,]+/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
      
      if (numbers.length === 0) return 5000; // Default if no numbers found
      if (numbers.length === 1) return numbers[0]; // Single value like "£15,000+"
      
      // For ranges like "£10,000-£20,000", use the midpoint
      return Math.round((Math.min(...numbers) + Math.max(...numbers)) / 2);
    };
    
    const budget = extractBudgetValue(values?.budget_band);
    trackBriefFormSubmitted({
      plan_value: budget,
      formats_count: values.formats?.length || 0,
      location: "London"
    });
    toast({ title: 'Brief sent', description: 'We’ll call you shortly.' });
    const thankYouUrl = `/thank-you?brief=1`
      + `&firstname=${encodeURIComponent(values.firstname)}`
      + `&budget=${encodeURIComponent(values.budget_band)}`
      + `&objective=${encodeURIComponent(objectiveFinal)}`
      + `&target_areas=${encodeURIComponent((values.target_areas || []).join(','))}`
      + `&formats=${encodeURIComponent((values.formats || []).join(','))}`
      + `&start_month=${encodeURIComponent(values.start_month || '')}`
      + `&creative_status=${encodeURIComponent(values.creative_status)}`
      + (values.notes ? `&notes=${encodeURIComponent(values.notes)}` : '');
    navigate(thankYouUrl);
  } catch (e: any) {
    toast({ title: 'Submission failed', description: e.message || 'Please try again.', variant: 'destructive' as any });
  }
}

  useEffect(() => { document.title = 'Talk to a Specialist | Media Buying London' }, []);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Talk to a Specialist</h1>
          <p className="text-muted-foreground mt-2">Prefer the phone? Call 020 4524 3019 now. Or send a quick brief and we’ll call you back fast.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild variant="outline"><a href="tel:+442045243019">Call now</a></Button>
            <Button onClick={() => {
              setStep(1);
              const el = document.getElementById('brief-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>Send brief</Button>
          </div>
        </div>
      </section>

      <section id="brief-form" className="py-10">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>{step === 1 ? 'Step 1 — Contact' : 'Step 2 — Your Brief'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, () => {
                  toast({
                    title: 'Please complete required fields',
                    description: 'Check all fields: contact details, budget, objective (and details), target areas, formats, start month, creative status, notes, and consent.',
                    variant: 'destructive' as any,
                  });
                })} className="space-y-8">
                  {/* Honeypot */}
                  <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...form.register('hp')} />

                  {step === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstname" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl><Input autoComplete="given-name" placeholder="Jane" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastname" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl><Input autoComplete="family-name" placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Work email</FormLabel>
                          <FormControl><Input type="email" autoComplete="email" placeholder="name@company.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl><Input type="tel" inputMode="tel" autoComplete="tel" placeholder="07..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl><Input autoComplete="organization" placeholder="Acme Ltd" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Website</FormLabel>
                          <FormControl><Input type="url" autoComplete="url" placeholder="https://... or company.com" {...field} /></FormControl>
                          <FormDescription>We’ll validate the domain automatically.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="jobtitle" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Role/Title</FormLabel>
                          <FormControl><Input autoComplete="organization-title" placeholder="Marketing Manager" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="sm:col-span-2 flex justify-end">
                        <Button type="button" onClick={() => setStep(2)}>Continue</Button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<FormField control={form.control} name="budget_band" render={({ field }) => (
  <FormItem>
    <FormLabel>Budget</FormLabel>
    <FormControl>
      <Input
        placeholder="Enter amount e.g. 15000"
        inputMode="numeric"
        pattern="[0-9]*"
        {...field}
      />
    </FormControl>
    <FormDescription>Numbers only; we’ll interpret this as GBP.</FormDescription>
    <FormMessage />
  </FormItem>
)} />

<FormField control={form.control} name="objective" render={({ field }) => (
  <FormItem>
    <FormLabel>Primary objective</FormLabel>
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <FormControl>
        <SelectTrigger><SelectValue placeholder="Select objective" /></SelectTrigger>
      </FormControl>
      <SelectContent>
        {objectives.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
)} />
{objectiveValue === 'Other' && (
  <FormField control={form.control} name="objective_other" render={({ field }) => (
    <FormItem>
      <FormLabel>Specify objective</FormLabel>
      <FormControl><Input placeholder="Type your objective" {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
)}

{/* Target areas with search and zones */}
<FormField control={form.control} name="target_areas" render={() => (
  <FormItem className="sm:col-span-2">
    <FormLabel>Target areas</FormLabel>
    <LocationSelector
      selectedLocations={form.watch('target_areas') || []}
      onSelectionChange={(locs) => form.setValue('target_areas', locs)}
      title="London Areas"
      description="Select your London areas."
      showSelectedSummary
      maxHeight="320px"
    />
    <FormDescription>Select your London areas.</FormDescription>
    <FormMessage />
  </FormItem>
)} />

{/* Preferred formats with search and category */}
<FormField control={form.control} name="formats" render={() => (
  <FormItem className="sm:col-span-2">
    <FormLabel>Preferred formats</FormLabel>
    <div className="grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search formats..."
          value={formatSearch}
          onChange={(e) => setFormatSearch(e.target.value)}
        />
        <Select onValueChange={(v) => setFormatCategory((v as any) || 'all')} defaultValue="all">
          <FormControl>
            <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {HARDCODED_FORMAT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="max-h-56 overflow-auto border rounded-md p-3 space-y-2">
        {filteredFormatNames.map((name) => (
          <label key={name} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.getValues('formats')?.includes(name) || false}
              onCheckedChange={(checked) => {
                const current = new Set(form.getValues('formats') || [])
                if (checked) current.add(name); else current.delete(name);
                form.setValue('formats', Array.from(current))
              }}
            />
            <span>{name}</span>
          </label>
        ))}
        
        {/* Special "Open to recommendations" option for larger formats */}
        <label className="flex items-center gap-2 text-sm border-t pt-2 mt-2">
          <Checkbox
            checked={form.getValues('formats')?.includes('Above 48" - Open to recommendations') || false}
            onCheckedChange={(checked) => {
              const current = new Set(form.getValues('formats') || [])
              if (checked) current.add('Above 48" - Open to recommendations'); else current.delete('Above 48" - Open to recommendations');
              form.setValue('formats', Array.from(current))
            }}
          />
          <span className="text-primary font-medium">Above 48" - Open to recommendations</span>
        </label>
        
        {filteredFormatNames.length === 0 && (
          <p className="text-sm text-muted-foreground">No formats found.</p>
        )}
      </div>
    </div>
    <FormMessage />
  </FormItem>
)} />

                      <FormField control={form.control} name="start_month" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Earliest start month</FormLabel>
                          <FormControl><Input type="month" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="creative_status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creative assets</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {creativeStatuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Anything else?</FormLabel>
                          <FormControl><Textarea rows={4} placeholder="Tell us about audiences, timings, locations, or anything important" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="consent" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <div className="flex items-start gap-2">
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            <div>
                              <FormLabel>I agree to be contacted about my enquiry.</FormLabel>
                              <FormDescription>We’ll never share your details.</FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

<div className="sm:col-span-2 flex justify-between">
  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={form.formState.isSubmitting}>Back</Button>
  <Button type="submit" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
    {form.formState.isSubmitting ? 'Sending…' : 'Send brief'}
  </Button>
</div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

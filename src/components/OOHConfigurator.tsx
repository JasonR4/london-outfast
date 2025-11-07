import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Target, Users, MapPin, Clock, DollarSign, Eye, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BriefFormSection from './BriefFormSection';
import { LocationSelector } from './LocationSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useQuotes } from '@/hooks/useQuotes';
import { MediaPlanModal } from './MediaPlanModal';
import { MediaPlanGenerator, GeneratedMediaPlan } from '@/services/MediaPlanGenerator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/money';
import { ToastAction } from '@/components/ui/toast';
import { trackCampaignItemAdded } from '@/utils/analytics';
import { computeMedia, formatGBP, countPrintRuns, uniquePeriodsCount } from '@/lib/pricingMath';

export interface Answer {
  questionId: string;
  value: string | number | (string | number)[];
  scores: Record<string, number>;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'range' | 'location' | 'periods' | 'budget_input';
  options: Array<{
    label: string;
    value: string | number;
    scores: Record<string, number>;
    icon?: string;
  }>;
  condition?: (answers: Answer[]) => boolean;
}

interface OOHRecommendation {
  format: string;
  formatName: string;
  score: number;
  reasons: string[];
  description: string;
  image?: string;
  calculatedQuantity?: number;
  budgetAllocation?: number;
  costPerUnit?: number;
}

const questions: Question[] = [
  {
    id: 'campaign_objective',
    title: 'What are your campaign objectives?',
    subtitle: 'Select all that apply - you can have multiple goals',
    type: 'multiple',
    options: [
      {
        label: 'Brand Awareness',
        value: 'awareness',
        scores: { 'billboards': 8, 'digital_billboards': 9, 'bus_shelters': 6, 'tube_ads': 7, 'taxi_ads': 5 },
        icon: 'Eye'
      },
      {
        label: 'Drive Traffic/Sales',
        value: 'traffic',
        scores: { 'digital_billboards': 9, 'tube_ads': 8, 'bus_shelters': 7, 'billboards': 6, 'taxi_ads': 8 },
        icon: 'Target'
      },
      {
        label: 'Local Presence',
        value: 'local',
        scores: { 'bus_shelters': 9, 'local_billboards': 8, 'tube_ads': 6, 'taxi_ads': 7, 'digital_billboards': 5 },
        icon: 'MapPin'
      },
      {
        label: 'Event Promotion',
        value: 'event',
        scores: { 'digital_billboards': 10, 'tube_ads': 8, 'bus_shelters': 6, 'taxi_ads': 7, 'billboards': 5 },
        icon: 'Zap'
      }
    ]
  },
  {
    id: 'campaign_budget',
    title: 'What\'s your campaign budget?',
    subtitle: 'Enter your total budget amount (e.g., £25000 or £25K)',
    type: 'budget_input',
    options: [] // No predefined options for text input
  },
  {
    id: 'target_audience',
    title: 'Who\'s your target audience?',
    subtitle: 'Select all audience groups you want to reach',
    type: 'multiple',
    options: [
      {
        label: 'Commuters & Office Workers',
        value: 'commuters',
        scores: { 'tube_ads': 10, 'bus_shelters': 8, 'billboards': 6, 'digital_billboards': 7, 'taxi_ads': 9 }
      },
      {
        label: 'Shoppers & Consumers',
        value: 'shoppers',
        scores: { 'bus_shelters': 9, 'billboards': 8, 'digital_billboards': 8, 'tube_ads': 6, 'taxi_ads': 7 }
      },
      {
        label: 'Tourists & Visitors',
        value: 'tourists',
        scores: { 'billboards': 9, 'digital_billboards': 8, 'tube_ads': 9, 'bus_shelters': 6, 'taxi_ads': 8 }
      },
      {
        label: 'Local Residents',
        value: 'residents',
        scores: { 'bus_shelters': 10, 'local_billboards': 9, 'taxi_ads': 7, 'tube_ads': 5, 'digital_billboards': 6 }
      },
      {
        label: 'Young Demographics (18-35)',
        value: 'young',
        scores: { 'digital_billboards': 9, 'tube_ads': 8, 'taxi_ads': 8, 'bus_shelters': 7, 'billboards': 6 }
      }
    ]
  },
  {
    id: 'preferred_locations',
    title: 'Which London areas are most important?',
    subtitle: 'Select your priority locations for maximum impact',
    type: 'location',
    options: [] // Will be handled by LocationSelector
  },
  {
    id: 'campaign_periods',
    title: 'Select your campaign periods',
    subtitle: 'Choose the incharge periods for your campaign. Non-consecutive periods = additional print runs (production only).',
    type: 'periods',
    options: [] // Will be handled by period selector
  },
  {
    id: 'creative_ready',
    title: 'Do you have creative assets ready?',
    subtitle: 'This affects timeline and format options',
    type: 'single',
    options: [
      {
        label: 'Yes, ready to go',
        value: 'ready',
        scores: { 'billboards': 2, 'digital_billboards': 2, 'bus_shelters': 2, 'tube_ads': 2, 'taxi_ads': 2 }
      },
      {
        label: 'Need minor adjustments',
        value: 'adjustments',
        scores: { 'digital_billboards': 1, 'billboards': 1, 'bus_shelters': 1, 'tube_ads': 1, 'taxi_ads': 1 }
      },
      {
        label: 'Need full creative development',
        value: 'development',
        scores: { 'billboards': -1, 'digital_billboards': -2, 'bus_shelters': 0, 'tube_ads': -1, 'taxi_ads': 0 }
      }
    ]
  },
  {
    id: 'dynamic_content',
    title: 'Do you need dynamic content updates?',
    subtitle: 'Real-time updates, scheduling, or data-driven content',
    type: 'single',
    condition: (answers) => {
      const objective = answers.find(a => a.questionId === 'campaign_objective')?.value;
      return objective === 'traffic' || objective === 'event';
    },
    options: [
      {
        label: 'Yes, real-time updates needed',
        value: 'dynamic',
        scores: { 'digital_billboards': 10, 'tube_ads': 3, 'bus_shelters': 2, 'billboards': 0, 'taxi_ads': 5 }
      },
      {
        label: 'Scheduled updates would be useful',
        value: 'scheduled',
        scores: { 'digital_billboards': 7, 'tube_ads': 2, 'bus_shelters': 1, 'billboards': 0, 'taxi_ads': 3 }
      },
      {
        label: 'Static content is fine',
        value: 'static',
        scores: { 'billboards': 3, 'bus_shelters': 3, 'tube_ads': 2, 'digital_billboards': 0, 'taxi_ads': 2 }
      }
    ]
  },
  {
    id: 'measurement_priority',
    title: 'How important is campaign measurement?',
    subtitle: 'Tracking views, engagement, and ROI',
    type: 'single',
    options: [
      {
        label: 'Essential - need detailed analytics',
        value: 'essential',
        scores: { 'digital_billboards': 8, 'taxi_ads': 6, 'tube_ads': 4, 'bus_shelters': 3, 'billboards': 1 }
      },
      {
        label: 'Important - basic metrics needed',
        value: 'important',
        scores: { 'digital_billboards': 5, 'taxi_ads': 4, 'tube_ads': 3, 'bus_shelters': 2, 'billboards': 1 }
      },
      {
        label: 'Not a priority',
        value: 'not_priority',
        scores: { 'billboards': 2, 'bus_shelters': 2, 'tube_ads': 1, 'digital_billboards': 0, 'taxi_ads': 1 }
      }
    ]
  },
  {
    id: 'brand_visibility',
    title: 'What level of brand visibility do you want?',
    subtitle: 'Impact level and reach considerations',
    type: 'single',
    condition: (answers) => {
      const objective = answers.find(a => a.questionId === 'campaign_objective')?.value;
      return objective === 'awareness' || objective === 'local';
    },
    options: [
      {
        label: 'Maximum impact - be impossible to miss',
        value: 'maximum',
        scores: { 'billboards': 10, 'digital_billboards': 9, 'tube_ads': 7, 'bus_shelters': 5, 'taxi_ads': 6 }
      },
      {
        label: 'High visibility in key areas',
        value: 'high',
        scores: { 'digital_billboards': 8, 'billboards': 8, 'tube_ads': 8, 'bus_shelters': 6, 'taxi_ads': 7 }
      },
      {
        label: 'Consistent presence over time',
        value: 'consistent',
        scores: { 'bus_shelters': 9, 'tube_ads': 7, 'billboards': 6, 'digital_billboards': 5, 'taxi_ads': 8 }
      }
    ]
  }
];

const formatDescriptions = {
  'billboards': {
    name: '48 Sheet Billboards',
    description: 'Large format billboards for maximum impact and brand awareness',
    strengths: ['High visibility', 'Strong brand presence', 'Cost-effective for awareness'],
    platforms: [
      'Prime roadside locations across London',
      'High-traffic arterial routes',
      'Strategic junction positions',
      'Major approach roads to central London',
      'Key commuter corridors'
    ]
  },
  'digital_billboards': {
    name: 'Digital Billboards', 
    description: 'Dynamic digital displays with real-time content updates and targeting',
    strengths: ['Real-time updates', 'Dynamic content', 'Better measurement', 'Flexible scheduling'],
    platforms: [
      'Premium digital sites in Zone 1',
      'Major shopping center displays',
      'Transport interchange screens',
      'High-footfall pedestrian areas',
      'Strategic roadside digital panels',
      'Interactive touch screen displays'
    ]
  },
  'bus_shelters': {
    name: 'Bus Shelter Advertising',
    description: 'Street-level advertising with high local impact and dwell time',
    strengths: ['Local targeting', 'High dwell time', 'Weather protection', 'Pedestrian focus'],
    platforms: [
      'Central London bus shelter network',
      'High Street locations',
      'Shopping district shelters',
      'Residential area stops',
      'Transport interchange shelters',
      'Business district locations',
      'Tourist area coverage'
    ]
  },
  'tube_ads': {
    name: 'London Underground Ads',
    description: 'Reach commuters throughout the extensive London transport network',
    strengths: ['Captive audience', 'High frequency', 'Commuter targeting', 'Network coverage'],
    platforms: [
      'Platform advertising (all major lines)',
      'Escalator panel advertising',
      'Tube car interior cards',
      'Station concourse displays',
      'Digital platform screens',
      'Ticket hall advertising',
      'Cross-track advertising',
      'Tunnel advertising',
      'Platform end displays',
      'Moving walkway advertising',
      'Interactive digital totems'
    ]
  },
  'taxi_ads': {
    name: 'Taxi Advertising',
    description: 'Mobile advertising reaching diverse audiences across London',
    strengths: ['Mobile reach', 'Flexible coverage', 'Premium audience', 'GPS tracking'],
    platforms: [
      'Black cab rear window displays',
      'Taxi roof top advertising',
      'Interior passenger screens',
      'Door panel advertising',
      'Digital tip screens',
      'Uber/taxi app advertising',
      'Ride-share vehicle branding'
    ]
  },
  'local_billboards': {
    name: 'Local Billboards',
    description: 'Smaller format billboards perfect for community and local targeting',
    strengths: ['Community focus', 'Local presence', 'Cost-effective', 'Neighborhood targeting'],
    platforms: [
      'Local high street locations',
      'Community center displays',
      'Local transport hubs',
      'Neighborhood shopping areas',
      'Residential approach roads'
    ]
  }
};

interface OOHConfiguratorProps {
  onComplete?: () => void;
}

export const OOHConfigurator = ({ onComplete }: OOHConfiguratorProps = {}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [inchargePeriods, setInchargePeriods] = useState<any[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [showMediaPlan, setShowMediaPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMediaPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [recommendations, setRecommendations] = useState<OOHRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const { addQuoteItem, createOrGetQuote, fetchCurrentQuote } = useQuotes();
  const { toast } = useToast();

  const MIN_BUDGET_GBP = 1000;
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const parseBudget = (input: string): number => {
    if (!input) return 0;
    const txt = input.trim().toLowerCase();
    const k = /k\b/.test(txt);
    const n = Number(txt.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(n)) return 0;
    return k ? Math.round(n * 1000) : Math.round(n);
  };
  
  // Fetch incharge periods on component mount
  useEffect(() => {
    const fetchInchargePeriods = async () => {
      try {
        console.log('🔍 Fetching incharge periods...');
        const { data, error } = await supabase
          .from('incharge_periods')
          .select('*')
          .order('period_number', { ascending: true });
        
        if (error) {
          console.error('❌ Supabase error fetching periods:', error);
          throw error;
        }
        
        console.log('✅ Raw incharge periods data:', data?.length || 0, 'periods found');
        console.log('📋 Periods:', data);
        
        // Transform the data to match expected format
        const transformedData = (data || []).map(period => ({
          ...period,
          label: `Period ${period.period_number}: ${new Date(period.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date(period.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        }));
        
        console.log('🔄 Transformed periods for UI:', transformedData.length, 'periods ready');
        setInchargePeriods(transformedData);
      } catch (error) {
        console.error('💥 Error fetching incharge periods:', error);
        setInchargePeriods([]);
      }
    };

    fetchInchargePeriods();
  }, []);

  const getVisibleQuestions = () => {
    return questions.filter(q => !q.condition || q.condition(answers));
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

  const handleAnswer = (option: any) => {
    if (currentQuestion.type === 'multiple') {
      const newSelection = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      setSelectedValues(newSelection);
    } else {
      setSelectedValues([option.value]);
    }
  };

  const handleLocationChange = (locations: string[]) => {
    setSelectedValues(locations);
  };

  const calculateLocationScores = (locations: string[]): Record<string, number> => {
    // Base scoring system for different location types
    const locationScores: Record<string, number> = {
      'billboards': 0,
      'digital_billboards': 0, 
      'bus_shelters': 0,
      'tube_ads': 0,
      'taxi_ads': 0,
      'local_billboards': 0
    };

    // Central/Premium locations favor high-impact formats
    const centralAreas = ['Westminster', 'City of London', 'Covent Garden', 'Soho', 'Mayfair'];
    const residentialAreas = ['Hampstead', 'Chelsea', 'Kensington', 'Fulham', 'Hammersmith'];
    const businessAreas = ['Canary Wharf', 'Barbican', 'Farringdon', 'King\'s Cross'];

    locations.forEach(location => {
      if (centralAreas.some(area => location.includes(area))) {
        locationScores['billboards'] += 8;
        locationScores['digital_billboards'] += 9;
        locationScores['tube_ads'] += 8;
        locationScores['bus_shelters'] += 6;
        locationScores['taxi_ads'] += 8;
      } else if (businessAreas.some(area => location.includes(area))) {
        locationScores['tube_ads'] += 10;
        locationScores['digital_billboards'] += 8;
        locationScores['billboards'] += 7;
        locationScores['bus_shelters'] += 6;
        locationScores['taxi_ads'] += 9;
      } else if (residentialAreas.some(area => location.includes(area))) {
        locationScores['bus_shelters'] += 9;
        locationScores['local_billboards'] += 8;
        locationScores['taxi_ads'] += 7;
        locationScores['tube_ads'] += 5;
        locationScores['billboards'] += 6;
      } else {
        // Default scoring for other areas
        locationScores['bus_shelters'] += 7;
        locationScores['billboards'] += 6;
        locationScores['tube_ads'] += 6;
        locationScores['digital_billboards'] += 5;
        locationScores['taxi_ads'] += 6;
      }
    });

    return locationScores;
  };

  const goNext = () => {
  // Check if we can proceed based on question type
  if (currentQuestion.type === 'budget_input') {
    if (!budgetInput.trim()) return;
    const value = parseBudget(budgetInput);
    if (value < MIN_BUDGET_GBP) {
      setBudgetError(`Minimum campaign budget is £${MIN_BUDGET_GBP.toLocaleString()}.`);
      toast({
        title: 'Budget too low',
        description: `Our minimum is £${MIN_BUDGET_GBP.toLocaleString()} to ensure real delivery and production costs.`,
        action: (
          <ToastAction altText="Call us" asChild>
            <a href="tel:02071234567">Call us</a>
          </ToastAction>
        ),
        variant: 'destructive'
      });
      return; // BLOCK progression
    }
    setBudgetError(null);
  } else {
    if (selectedValues.length === 0) return;
  }

    // Calculate scores for this answer
    let combinedScores: Record<string, number> = {};
    
    if (currentQuestion.type === 'location') {
      combinedScores = calculateLocationScores(selectedValues as string[]);
    } else if (currentQuestion.type === 'periods') {
      // For periods, add scoring based on campaign length
      const periodCount = selectedValues.length;
      combinedScores = {
        'billboards': periodCount >= 3 ? 5 : 3,
        'digital_billboards': periodCount >= 2 ? 6 : 4,
        'bus_shelters': periodCount >= 4 ? 7 : 5,
        'tube_ads': periodCount >= 2 ? 6 : 4,
        'taxi_ads': periodCount >= 1 ? 5 : 3,
        'local_billboards': periodCount >= 4 ? 6 : 4
      };
    } else if (currentQuestion.type === 'multiple') {
      selectedValues.forEach(value => {
        const option = currentQuestion.options.find(opt => opt.value === value);
        if (option) {
          Object.entries(option.scores).forEach(([format, score]) => {
            combinedScores[format] = (combinedScores[format] || 0) + score;
          });
        }
      });
    } else {
      const option = currentQuestion.options.find(opt => opt.value === selectedValues[0]);
      if (option) {
        combinedScores = option.scores;
      }
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value: currentQuestion.type === 'budget_input' ? budgetInput : 
             (currentQuestion.type === 'multiple' || currentQuestion.type === 'location' || currentQuestion.type === 'periods' ? selectedValues : selectedValues[0]),
      scores: combinedScores
    };

    

    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setAnswers(newAnswers);
    setSelectedValues([]);
    setBudgetInput('');

    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Scroll to top when moving to next question
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Load recommendations when showing results
      setIsLoadingRecommendations(true);
      calculateRecommendations().then(recs => {
        setRecommendations(recs);
        setIsLoadingRecommendations(false);
        setShowResults(true);
        // Scroll to top when showing results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Scroll to top when going back
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Restore previous answer
      const prevQuestion = visibleQuestions[currentQuestionIndex - 1];
      const prevAnswer = answers.find(a => a.questionId === prevQuestion.id);
      if (prevAnswer) {
        const prevValue = prevAnswer.value;
        if (Array.isArray(prevValue)) {
          setSelectedValues(prevValue);
        } else {
          setSelectedValues([prevValue]);
        }
      } else {
        setSelectedValues([]);
      }
    }
  };

  const calculateRecommendations = async (): Promise<OOHRecommendation[]> => {
    try {
      // Get actual media formats from database
      const { data: mediaFormats } = await supabase
        .from('media_formats')
        .select('*')
        .eq('is_active', true);

      if (!mediaFormats) return [];

      // Get budget from answers
      const budgetAnswer = answers.find(a => a.questionId === 'campaign_budget');
      const budgetInput = budgetAnswer?.value as string || '';
      const budget = parseBudgetInput(budgetInput);
      
      // Get selected periods
      const selectedPeriods = getSelectedPeriods();
      const periodsCount = selectedPeriods.length || 2;

      const formatScores: Record<string, number> = {};
      const formatReasons: Record<string, string[]> = {};

      // Initialize scores for actual media formats
      mediaFormats.forEach(format => {
        formatScores[format.format_slug] = 0;
        formatReasons[format.format_slug] = [];
      });

      // Calculate total scores from answers (map old slugs to new ones where possible)
      answers.forEach(answer => {
        Object.entries(answer.scores).forEach(([format, score]) => {
          // Map old format slugs to new ones
          const mappedFormat = mapFormatSlug(format);
          if (formatScores.hasOwnProperty(mappedFormat)) {
            formatScores[mappedFormat] += score;
          }
        });
      });

      // Get top scoring formats
      const topFormats = Object.entries(formatScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      const recommendations: OOHRecommendation[] = [];
      
      // Check if user needs creative help
      const needsCreative = getCreativeNeeds() !== 'ready';
      
      // Only show top 2 recommendations and split budget between them
      const limitedFormats = topFormats.slice(0, 2);

      for (let i = 0; i < limitedFormats.length; i++) {
        const [formatSlug, score] = limitedFormats[i];
        const mediaFormat = mediaFormats.find(f => f.format_slug === formatSlug);
        if (!mediaFormat) continue;

        // Split budget: 65% for first, 35% for second
        const allocatedBudget = i === 0 ? Math.floor(budget * 0.65) : Math.floor(budget * 0.35);
        
        // Use the full allocated budget to maximize utilization
        const mediaBudget = allocatedBudget * 0.7;
        const costData = await calculateRealCosts(mediaFormat.id, mediaBudget, periodsCount);
        
        // Calculate production costs (15% of allocated budget)
        const productionBudget = allocatedBudget * 0.15;
        const productionCost = await calculateProductionCost(mediaFormat.id, costData.quantity, productionBudget);
        
        // Calculate creative costs (15% of allocated budget, only if needed)
        const creativeBudget = needsCreative ? allocatedBudget * 0.15 : 0;
        const creativeCost = needsCreative ? await calculateCreativeCost(mediaFormat.id, costData.quantity, creativeBudget) : 0;
        
        // Force the total to match the allocated budget for maximum utilization
        const totalCost = allocatedBudget;
        
        // Generate reasons based on answers
        const reasons = generateReasons(formatSlug, mediaFormat);

        recommendations.push({
          format: formatSlug,
          formatName: mediaFormat.format_name,
          score,
          reasons,
          description: mediaFormat.description || '',
          calculatedQuantity: costData.quantity,
          budgetAllocation: totalCost,
          costPerUnit: costData.costPerUnit
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error calculating recommendations:', error);
      return [];
    }
  };

  const parseBudgetInput = (budgetStr: string): number => {
    if (!budgetStr) return 25000;
    
    const cleanBudget = budgetStr.replace(/[£,\s]/g, '').toLowerCase();
    
    if (cleanBudget.endsWith('k')) {
      const baseAmount = parseFloat(cleanBudget.replace('k', ''));
      if (!isNaN(baseAmount)) {
        return baseAmount * 1000;
      }
    } else {
      const budget = parseFloat(cleanBudget);
      if (!isNaN(budget)) {
        return budget;
      }
    }
    
    return 25000;
  };

  const mapFormatSlug = (oldSlug: string): string => {
    const mapping: Record<string, string> = {
      'billboards': '48-sheet-billboard',
      'digital_billboards': 'digital-48-sheet',
      'tube_ads': '6-sheet-tube-panel', // Map to most common tube format
      'taxi_ads': 'taxi-advertising',
      'bus_shelters': 'bus-shelter-supersites',
      'local_billboards': 'lamp-post-banners'
    };
    return mapping[oldSlug] || oldSlug;
  };

  const calculateRealCosts = async (mediaFormatId: string, budget: number, periodsCount: number) => {
    try {
      // Get rate cards for this format
      const { data: rateCards } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('media_format_id', mediaFormatId)
        .eq('is_active', true)
        .limit(1);

      if (!rateCards || rateCards.length === 0) {
        const maxQuantity = Math.floor(budget / 3000);
        return {
          quantity: Math.max(1, maxQuantity),
          totalCost: Math.min(budget, maxQuantity * 3000),
          costPerUnit: 3000
        };
      }

      const rateCard = rateCards[0];
      const baseRate = rateCard.base_rate_per_incharge;
      const adjustedRate = (rateCard.sale_price ?? rateCard.reduced_price ?? baseRate);

      // Apply discount tiers
      const { data: discountTiers } = await supabase
        .from('discount_tiers')
        .select('*')
        .eq('media_format_id', mediaFormatId)
        .eq('is_active', true)
        .lte('min_periods', periodsCount)
        .or(`max_periods.is.null,max_periods.gte.${periodsCount}`)
        .order('discount_percentage', { ascending: false })
        .limit(1);

      const discount = discountTiers?.[0]?.discount_percentage || 0;
      const discountMultiplier = 1 - (discount / 100);
      const finalRate = adjustedRate * discountMultiplier;
      
      const costPerUnit = finalRate * periodsCount;
      // Use the full allocated budget, not just 70%
      const quantity = Math.max(1, Math.floor(budget / costPerUnit));
      const totalCost = Math.min(budget, costPerUnit * quantity);

      return {
        quantity,
        totalCost,
        costPerUnit
      };
    } catch (error) {
      console.error('Error calculating real costs:', error);
      const fallbackQuantity = Math.floor(budget / 3000);
      return {
        quantity: Math.max(1, fallbackQuantity),
        totalCost: Math.min(budget, fallbackQuantity * 3000),
        costPerUnit: 3000
      };
    }
  };

  const calculateProductionCost = async (mediaFormatId: string, quantity: number, maxBudget: number): Promise<number> => {
    try {
      const { data: productionTiers } = await supabase
        .from('production_cost_tiers')
        .select('*')
        .eq('media_format_id', mediaFormatId)
        .eq('is_active', true)
        .lte('min_quantity', quantity)
        .or(`max_quantity.is.null,max_quantity.gte.${quantity}`)
        .order('cost_per_unit', { ascending: true })
        .limit(1);

      if (productionTiers && productionTiers.length > 0) {
        const cost = productionTiers[0].cost_per_unit * quantity;
        return Math.min(cost, maxBudget);
      }

      return maxBudget * 0.5; // Fallback to 50% of max budget if no tiers found
    } catch (error) {
      console.error('Error calculating production cost:', error);
      return maxBudget * 0.5;
    }
  };

  const calculateCreativeCost = async (mediaFormatId: string, quantity: number, maxBudget: number): Promise<number> => {
    try {
      const { data: creativeTiers } = await supabase
        .from('creative_design_cost_tiers')
        .select('*')
        .eq('media_format_id', mediaFormatId)
        .eq('is_active', true)
        .lte('min_quantity', quantity)
        .or(`max_quantity.is.null,max_quantity.gte.${quantity}`)
        .order('cost_per_unit', { ascending: true })
        .limit(1);

      if (creativeTiers && creativeTiers.length > 0) {
        const cost = creativeTiers[0].cost_per_unit * quantity;
        return Math.min(cost, maxBudget);
      }

      return maxBudget * 0.5; // Fallback to 50% of max budget if no tiers found
    } catch (error) {
      console.error('Error calculating creative cost:', error);
      return maxBudget * 0.5;
    }
  };

  const generateReasons = (formatSlug: string, mediaFormat: any): string[] => {
    const reasons: string[] = [];
    
    const objective = answers.find(a => a.questionId === 'campaign_objective')?.value;
    const audience = answers.find(a => a.questionId === 'target_audience')?.value;
    
    // Add specific reasons based on format type and objectives
    if (formatSlug.includes('billboard') && (objective === 'awareness' || Array.isArray(objective) && objective.includes('awareness'))) {
      reasons.push('Perfect for brand awareness campaigns');
    }
    if (formatSlug.includes('tube') && (audience === 'commuters' || Array.isArray(audience) && audience.includes('commuters'))) {
      reasons.push('Reaches commuters effectively during peak hours');
    }
    if (formatSlug.includes('digital') && (objective === 'traffic' || Array.isArray(objective) && objective.includes('traffic'))) {
      reasons.push('Dynamic content for real-time campaign updates');
    }
    
    // Add cost-effectiveness reason
    reasons.push('Optimized for your budget allocation');
    
    // Add format-specific strength
    if (mediaFormat.description) {
      const descWords = mediaFormat.description.split(' ').slice(0, 8).join(' ');
      reasons.push(`${descWords}...`);
    }

    return reasons.slice(0, 3); // Limit to 3 reasons
  };

  // Helper functions to extract data from answers
  const getSelectedLocations = (): string[] => {
    const locationAnswer = answers.find(a => a.questionId === 'preferred_locations');
    if (!locationAnswer) return [];
    const value = locationAnswer.value;
    return Array.isArray(value) ? value.map(String) : [String(value)];
  };

  const getSelectedPeriods = (): number[] => {
    const periodsAnswer = answers.find(a => a.questionId === 'campaign_periods');
    if (!periodsAnswer) return [];
    const value = periodsAnswer.value;
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  };

  const getCreativeNeeds = (): string => {
    const creativeAnswer = answers.find(a => a.questionId === 'creative_ready');
    if (!creativeAnswer) return 'ready'; // Default to ready if no answer
    return String(creativeAnswer.value);
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedValues([]);
    setShowResults(false);
    setShowQuoteForm(false);
  };

  const getSelectedFormats = (): string[] => {
    return recommendations.map(rec => {
      const formatInfo = formatDescriptions[rec.format as keyof typeof formatDescriptions];
      return formatInfo?.name || rec.format;
    });
  };

  const getBudgetRange = (): string => {
    const budget = answers.find(a => a.questionId === 'budget_range')?.value;
    switch(budget) {
      case 'low': return '£1K - £5K';
      case 'lower_medium': return '£5K - £10K';
      case 'medium': return '£10K - £15K';
      case 'upper_medium': return '£15K - £20K';
      case 'high': return '£20K - £25K';
      case 'higher': return '£25K - £30K';
      case 'premium': return '£30K+';
      default: return '';
    }
  };

  const getCampaignObjective = (): string => {
    const objectiveAnswer = answers.find(a => a.questionId === 'campaign_objective')?.value;
    if (Array.isArray(objectiveAnswer)) {
      // Handle multiple objectives
      return objectiveAnswer.map(obj => {
        switch(obj) {
          case 'awareness': return 'Brand Awareness';
          case 'traffic': return 'Drive Traffic/Sales';
          case 'local': return 'Local Presence';
          case 'event': return 'Event Promotion';
          default: return obj;
        }
      }).join(' + ');
    } else {
      // Handle single objective
      switch(objectiveAnswer) {
        case 'awareness': return 'Brand Awareness';
        case 'traffic': return 'Drive Traffic/Sales';
        case 'local': return 'Local Presence';
        case 'event': return 'Event Promotion';
        default: return '';
      }
    }
  };

  const getTargetAudience = (): string => {
    const audienceAnswer = answers.find(a => a.questionId === 'target_audience')?.value;
    if (Array.isArray(audienceAnswer)) {
      // Handle multiple audiences
      return audienceAnswer.map(aud => {
        switch(aud) {
          case 'commuters': return 'Commuters & Office Workers';
          case 'shoppers': return 'Shoppers & Consumers';
          case 'tourists': return 'Tourists & Visitors';
          case 'residents': return 'Local Residents';
          case 'young': return 'Young Demographics (18-35)';
          default: return aud;
        }
      }).join(' + ');
    } else {
      // Handle single audience
      switch(audienceAnswer) {
        case 'commuters': return 'Commuters & Office Workers';
        case 'shoppers': return 'Shoppers & Consumers';
        case 'tourists': return 'Tourists & Visitors';
        case 'residents': return 'Local Residents';
        case 'young': return 'Young Demographics (18-35)';
        default: return '';
      }
    }
  };

  const generateMediaPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const generator = new MediaPlanGenerator();
      const plan = await generator.generatePlan(answers, inchargePeriods);
      
      if (plan) {
        setGeneratedPlan(plan);
        setShowMediaPlan(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to generate media plan. Please try again."
        });
      }
    } catch (error) {
      console.error('Error generating media plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate media plan"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const submitMediaPlan = async () => {
    if (!generatedPlan) return;
    
    setIsCreatingQuote(true);
    try {
      // Add plan items to quote with real calculated costs
      for (const item of generatedPlan.items) {
        await addQuoteItem({
          format_slug: item.formatSlug,
          format_name: item.formatName,
          quantity: item.recommendedQuantity,
          selected_areas: item.selectedAreas,
          selected_periods: item.selectedPeriods,
          base_cost: item.baseCost,
          production_cost: item.productionCost,
          creative_cost: item.creativeCost,
          total_cost: item.totalCost,
          creative_needs: `${generatedPlan.campaignObjective} campaign targeting ${generatedPlan.targetAudience}`
        });
        
        // Track each item addition in analytics
        try {
          trackCampaignItemAdded({
            formatName: item.formatName,
            quantity: item.recommendedQuantity,
            value: item.totalCost
          });
          console.log('📊 Analytics: Campaign item tracked from configurator media plan', {
            formatName: item.formatName,
            quantity: item.recommendedQuantity,
            value: item.totalCost,
            source: 'configurator-plan'
          });
        } catch (trackingError) {
          console.error('📊 Analytics tracking error (non-blocking):', trackingError);
        }
      }
      
      setShowMediaPlan(false);
      toast({
        title: "Success",
        description: "Media plan submitted successfully!"
      });
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting media plan:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to submit media plan"
      });
    } finally {
      setIsCreatingQuote(false);
    }
  };


  if (showQuoteForm) {
    return <BriefFormSection 
      prefilledFormats={getSelectedFormats()}
      budgetRange={getBudgetRange()}
      campaignObjective={getCampaignObjective()}
      targetAudience={getTargetAudience()}
      selectedLocations={getSelectedLocations()}
      selectedPeriods={getSelectedPeriods()}
      creativeNeeds={getCreativeNeeds()}
      onBack={() => setShowQuoteForm(false)}
    />;
  }

  if (showResults) {
    if (isLoadingRecommendations) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Analyzing Your Requirements</CardTitle>
              <p className="text-muted-foreground">Calculating optimal recommendations based on actual rate cards...</p>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your OOH Recommendations</CardTitle>
            <p className="text-muted-foreground">Based on your preferences and actual rate card data</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {recommendations.map((rec, index) => {
              const formatInfo = formatDescriptions[rec.format as keyof typeof formatDescriptions];
              return (
                <Card key={rec.format} className={`${index === 0 ? 'border-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{rec.formatName}</h3>
                        {index === 0 && <Badge variant="default" className="mt-1">Top Recommendation</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Match Score</div>
                        <div className="text-2xl font-bold text-primary">{Math.round((rec.score / Math.max(...recommendations.map(r => r.score))) * 100)}%</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{rec.description}</p>
                    
                     {/* Show calculated quantity and budget breakdown */}
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Recommended Units:</span>
                          <div className="text-lg font-bold text-primary">{rec.calculatedQuantity || 'TBC'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Cost Breakdown:</span>
                        </div>
                      </div>
                      
                      {rec.budgetAllocation && (
                        <div className="space-y-2 text-sm">
                          {(() => {
                            const selectedPeriods = getSelectedPeriods();
                            const pCount = uniquePeriodsCount(selectedPeriods);
                            const sites = rec.calculatedQuantity || 0;
                            const rate = sites && pCount ? (rec.costPerUnit || 0) / pCount : 0;
                            const media = { ...computeMedia({ saleRate: rate, sites, periods: selectedPeriods }) };
                            return (
                              <>
                                <div className="flex justify-between"><span className="text-muted-foreground">Media rate (per in-charge)</span><span>{formatGBP(media.rate)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Media (before discount)</span><span>{formatGBP(media.before)}</span></div>
                                {media.showDiscount && (
                                  <div className="flex justify-between text-emerald-400"><span>💰 Volume discount (10% for 3+ in-charge periods)</span><span>-{formatGBP(media.discount)}</span></div>
                                )}
                                <div className="flex justify-between"><span className="text-muted-foreground">Media (after discount)</span><span>{formatGBP(media.after)}</span></div>
                              </>
                            );
                          })()}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Production Costs:</span>
                            <span>{formatCurrency(rec.budgetAllocation * 0.15)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Creative Development:</span>
                            <span>{formatCurrency(rec.budgetAllocation * 0.15)}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-border/50">
                            <span>Subtotal (exc VAT):</span>
                            <span>{formatCurrency(rec.budgetAllocation)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">VAT (20%):</span>
                            <span>{formatCurrency(rec.budgetAllocation * 0.2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-primary pt-2 border-t border-border/50">
                            <span>Total inc VAT:</span>
                            <span>{formatCurrency(rec.budgetAllocation * 1.2)} inc VAT</span>
                          </div>
                          {(() => { const runs = countPrintRuns(getSelectedPeriods()); return runs > 1 ? (<div className="mt-2 text-xs opacity-80">Non-consecutive periods = {runs} print runs (production only).</div>) : null; })()}
                          {(() => { const selectedPeriods = getSelectedPeriods(); const sites = rec.calculatedQuantity || 0; const pCount = selectedPeriods ? new Set(selectedPeriods.map(String)).size : 0; const rate = sites && pCount ? (rec.costPerUnit || 0) / pCount : 0; const media = computeMedia({ saleRate: rate, sites, periods: selectedPeriods }); return media.showDiscount ? (<div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><div className="text-xs text-green-700 dark:text-green-300 font-medium">🎉 Volume discounts applied! Total savings: {formatCurrency(media.discount * 1.2)} inc VAT</div></div>) : null; })()}
                        </div>
                      )}
                      
                      {rec.costPerUnit && (
                        <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                          Cost per unit: {formatCurrency(rec.costPerUnit)} × {rec.calculatedQuantity} units
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Why this works for you:</h4>
                      <ul className="space-y-1">
                        {rec.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <div className="flex gap-4 pt-6">
              <Button onClick={restart} variant="outline" className="flex-1">
                Start Over
              </Button>
              <Button
                onClick={generateMediaPlan}
                disabled={isGeneratingPlan}
                className="flex-1 bg-gradient-hero hover:opacity-90"
              >
                {isGeneratingPlan ? 'Generating Plan...' : 'Generate Media Plan'}
              </Button>
              <Button 
                onClick={async () => {
                  setIsCreatingQuote(true);
                  try {
                    console.log('=== STARTING QUOTE CREATION ===');
                    console.log('Current recommendations:', recommendations);
                    
                    // Create or get quote first
                    const quoteId = await createOrGetQuote();
                    console.log('Quote ID:', quoteId);
                    
                    // Clear existing quote items for this quote to avoid duplicates
                    const { data: existingItems, error: fetchError } = await supabase
                      .from('quote_items')
                      .select('id, format_name, quantity, total_cost')
                      .eq('quote_id', quoteId);
                    
                    console.log('Existing items before clear:', existingItems);
                    
                    if (existingItems && existingItems.length > 0) {
                      const { error: deleteError } = await supabase
                        .from('quote_items')
                        .delete()
                        .eq('quote_id', quoteId);
                      console.log('Delete error:', deleteError);
                      console.log('Cleared', existingItems.length, 'existing items');
                    }
                    
                    // Get recommendations and add them as quote items
                    const selectedLocations = getSelectedLocations();
                    const selectedPeriods = getSelectedPeriods();
                    console.log('Selected locations:', selectedLocations);
                    console.log('Selected periods:', selectedPeriods);
                    
                    // Add quote items for each recommendation using EXACT recommendation data
                    for (const rec of recommendations) {
                      console.log('=== PROCESSING RECOMMENDATION ===');
                      console.log('Recommendation object:', rec);
                      console.log('Format:', rec.format);
                      console.log('Calculated quantity:', rec.calculatedQuantity);
                      console.log('Budget allocation:', rec.budgetAllocation);
                      
                      const formatInfo = formatDescriptions[rec.format as keyof typeof formatDescriptions];
                      const totalCost = (rec.budgetAllocation || 0);
                      
                      const quoteItemData = {
                        quote_id: quoteId,
                        format_name: formatInfo?.name || rec.format,
                        format_slug: rec.format,
                        quantity: rec.calculatedQuantity || 1,
                        selected_periods: selectedPeriods,
                        selected_areas: selectedLocations,
                        production_cost: 0,
                        creative_cost: 0,
                        base_cost: totalCost,
                        total_cost: totalCost,
                        creative_needs: getCreativeNeeds(),
                        subtotal: totalCost,
                        vat_rate: 20,
                        vat_amount: totalCost * 0.2,
                        total_inc_vat: totalCost * 1.2,
                        discount_percentage: 0,
                        discount_amount: 0,
                        original_cost: totalCost
                      };
                      
                      console.log('Quote item data to add (direct insert):', quoteItemData);
                      
                      // Direct insert to avoid useQuotes calculations that override our data
                      const { data: insertedItem, error: insertError } = await supabase
                        .from('quote_items')
                        .insert(quoteItemData)
                        .select()
                        .maybeSingle();
                        
                      if (insertError) {
                        console.error('Insert error:', insertError);
                        throw insertError;
                      }
                      
                       console.log('Successfully inserted item:', insertedItem);
                       
                       // Track analytics for campaign item added
                       try {
                         trackCampaignItemAdded({
                           formatName: formatInfo?.name || rec.format,
                           quantity: rec.calculatedQuantity || 1,
                           value: totalCost
                         });
                         console.log('📊 Analytics: Campaign item tracked from configurator quick quote', {
                           formatName: formatInfo?.name || rec.format,
                           quantity: rec.calculatedQuantity || 1,
                           value: totalCost,
                           source: 'configurator-quick'
                         });
                       } catch (trackingError) {
                         console.error('📊 Analytics tracking error (non-blocking):', trackingError);
                       }
                      }
                      
                      // Refresh the current quote data to include new items
                      console.log('Refreshing quote data...');
                      await fetchCurrentQuote();
                      console.log('Quote data refreshed');
                      
                      // Add a small delay to ensure state updates complete before navigation
                      await new Promise(resolve => setTimeout(resolve, 100));
                      
                      onComplete?.();
                   } catch (error) {
                     console.error('Error creating quote items:', error);
                   } finally {
                     setIsCreatingQuote(false);
                   }
                }} 
                variant="outline"
                className="hidden sm:inline-flex"
                disabled={isCreatingQuote}
              >
                {isCreatingQuote ? 'Creating Quote...' : 'Quick Quote'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <MediaPlanModal
          isOpen={showMediaPlan}
          onClose={() => setShowMediaPlan(false)}
          onSubmitPlan={submitMediaPlan}
          mediaPlan={generatedPlan}
          isSubmitting={isCreatingQuote}
        />
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {visibleQuestions.length}
          </h2>
          <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
          {currentQuestion.subtitle && (
            <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.type === 'location' ? (
            <LocationSelector
              selectedLocations={selectedValues as string[]}
              onSelectionChange={handleLocationChange}
              title="Select Priority Areas"
              description="Choose the London areas most important for your campaign"
              maxHeight="300px"
            />
          ) : currentQuestion.type === 'periods' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select multiple periods for your campaign</p>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {inchargePeriods.length > 0 ? inchargePeriods.map((period) => {
                  console.log('🔍 Rendering period:', period.period_number, period.label);
                  return (
                    <div key={period.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={`period-${period.id}`}
                        checked={selectedValues.includes(period.period_number)}
                        onCheckedChange={(checked) => {
                          const newValues = checked 
                            ? [...selectedValues, period.period_number]
                            : selectedValues.filter(v => v !== period.period_number);
                          setSelectedValues(newValues);
                        }}
                      />
                      <label htmlFor={`period-${period.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">Period {period.period_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(period.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {' '}
                          {new Date(period.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </label>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading periods... ({inchargePeriods.length} found)
                  </div>
                )}
              </div>
            </div>
          ) : currentQuestion.type === 'budget_input' ? (
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="e.g. £25,000"
                inputMode="numeric"
                autoComplete="off"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                aria-invalid={!!budgetError}
                aria-describedby="budget-help budget-error"
                className="text-lg"
              />
              <p id="budget-help" className="text-xs text-muted-foreground">
                Enter the total for this campaign. You can type <b>25k</b>, <b>£25,000</b>, or <b>25000</b>.
              </p>
              {budgetError && (
                <p id="budget-error" className="text-xs text-destructive">{budgetError}</p>
              )}
            </div>
          ) : (
            currentQuestion.options.map((option, index) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left border rounded-lg transition-all hover:border-primary ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {option.icon && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {option.icon === 'Target' && <Target className="w-4 h-4 text-primary" />}
                        {option.icon === 'Users' && <Users className="w-4 h-4 text-primary" />}
                        {option.icon === 'MapPin' && <MapPin className="w-4 h-4 text-primary" />}
                        {option.icon === 'Clock' && <Clock className="w-4 h-4 text-primary" />}
                        {option.icon === 'DollarSign' && <DollarSign className="w-4 h-4 text-primary" />}
                        {option.icon === 'Eye' && <Eye className="w-4 h-4 text-primary" />}
                        {option.icon === 'Zap' && <Zap className="w-4 h-4 text-primary" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {currentQuestion.type === 'multiple' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Select multiple options
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            goBack();
          }}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            goNext();
          }}
          disabled={currentQuestion.type === 'budget_input' ? !budgetInput.trim() : selectedValues.length === 0}
          className="flex items-center space-x-2"
        >
          <span>{currentQuestionIndex === visibleQuestions.length - 1 ? 'Get Results' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
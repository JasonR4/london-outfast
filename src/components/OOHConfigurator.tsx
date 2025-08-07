import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Target, Users, MapPin, Clock, DollarSign, Eye, Zap } from 'lucide-react';
import QuoteFormSection from './QuoteFormSection';
import { LocationSelector } from './LocationSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useQuotes } from '@/hooks/useQuotes';
import { MediaPlanModal } from './MediaPlanModal';
import { MediaPlanGenerator, GeneratedMediaPlan } from '@/services/MediaPlanGenerator';
import { useToast } from '@/hooks/use-toast';

export interface Answer {
  questionId: string;
  value: string | number | (string | number)[];
  scores: Record<string, number>;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'range' | 'location' | 'periods';
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
  score: number;
  reasons: string[];
  description: string;
  image?: string;
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
    id: 'budget_range',
    title: 'What\'s your budget range?',
    subtitle: 'This helps us suggest formats within your budget',
    type: 'single',
    options: [
      {
        label: '£1K - £5K',
        value: 'low',
        scores: { 'bus_shelters': 8, 'local_billboards': 7, 'taxi_ads': 9, 'tube_ads': 5, 'digital_billboards': 3 }
      },
      {
        label: '£5K - £10K',
        value: 'lower_medium',
        scores: { 'bus_shelters': 9, 'tube_ads': 7, 'billboards': 6, 'digital_billboards': 5, 'taxi_ads': 8 }
      },
      {
        label: '£10K - £15K',
        value: 'medium',
        scores: { 'bus_shelters': 7, 'tube_ads': 8, 'billboards': 7, 'digital_billboards': 6, 'taxi_ads': 8 }
      },
      {
        label: '£15K - £20K',
        value: 'upper_medium',
        scores: { 'tube_ads': 8, 'billboards': 7, 'digital_billboards': 7, 'bus_shelters': 6, 'taxi_ads': 7 }
      },
      {
        label: '£20K - £25K',
        value: 'high',
        scores: { 'billboards': 8, 'digital_billboards': 8, 'tube_ads': 8, 'bus_shelters': 6, 'taxi_ads': 7 }
      },
      {
        label: '£25K - £30K',
        value: 'higher',
        scores: { 'billboards': 8, 'digital_billboards': 9, 'tube_ads': 8, 'bus_shelters': 5, 'taxi_ads': 6 }
      },
      {
        label: '£30K+',
        value: 'premium',
        scores: { 'digital_billboards': 10, 'billboards': 9, 'tube_ads': 8, 'bus_shelters': 4, 'taxi_ads': 6 }
      }
    ]
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
    subtitle: 'Choose the incharge periods for your campaign',
    type: 'periods',
    options: [] // Will be handled by period selector
  },
  {
    id: 'creative_needs',
    title: 'What are your creative requirements?',
    subtitle: 'This helps us understand your design and creative needs',
    type: 'single',
    options: [
      {
        label: 'I have my creative assets ready',
        value: 'ready',
        scores: { 'billboards': 2, 'digital_billboards': 2, 'bus_shelters': 2, 'tube_ads': 2, 'taxi_ads': 2 }
      },
      {
        label: 'I need design assistance',
        value: 'design_help',
        scores: { 'billboards': 1, 'digital_billboards': 1, 'bus_shelters': 1, 'tube_ads': 1, 'taxi_ads': 1 }
      },
      {
        label: 'I need full creative development',
        value: 'full_creative',
        scores: { 'billboards': 0, 'digital_billboards': 0, 'bus_shelters': 0, 'tube_ads': 0, 'taxi_ads': 0 }
      }
    ]
  },
  {
    id: 'urgency',
    title: 'How quickly do you need this live?',
    type: 'single',
    options: [
      {
        label: 'ASAP (within 1 week)',
        value: 'urgent',
        scores: { 'digital_billboards': 9, 'taxi_ads': 8, 'bus_shelters': 6, 'tube_ads': 5, 'billboards': 4 }
      },
      {
        label: '2-4 weeks',
        value: 'soon',
        scores: { 'bus_shelters': 8, 'billboards': 8, 'digital_billboards': 7, 'tube_ads': 7, 'taxi_ads': 8 }
      },
      {
        label: '1-3 months',
        value: 'planned',
        scores: { 'billboards': 9, 'tube_ads': 9, 'bus_shelters': 8, 'digital_billboards': 7, 'taxi_ads': 7 }
      }
    ]
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
    strengths: ['High visibility', 'Strong brand presence', 'Cost-effective for awareness']
  },
  'digital_billboards': {
    name: 'Digital Billboards', 
    description: 'Dynamic digital displays with real-time content updates and targeting',
    strengths: ['Real-time updates', 'Dynamic content', 'Better measurement', 'Flexible scheduling']
  },
  'bus_shelters': {
    name: 'Bus Shelter Advertising',
    description: 'Street-level advertising with high local impact and dwell time',
    strengths: ['Local targeting', 'High dwell time', 'Weather protection', 'Pedestrian focus']
  },
  'tube_ads': {
    name: 'London Underground Ads',
    description: 'Reach commuters throughout the extensive London transport network',
    strengths: ['Captive audience', 'High frequency', 'Commuter targeting', 'Network coverage']
  },
  'taxi_ads': {
    name: 'Taxi Advertising',
    description: 'Mobile advertising reaching diverse audiences across London',
    strengths: ['Mobile reach', 'Flexible coverage', 'Premium audience', 'GPS tracking']
  },
  'local_billboards': {
    name: 'Local Billboards',
    description: 'Smaller format billboards perfect for community and local targeting',
    strengths: ['Community focus', 'Local presence', 'Cost-effective', 'Neighborhood targeting']
  }
};

interface OOHConfiguratorProps {
  onComplete?: () => void;
}

export const OOHConfigurator = ({ onComplete }: OOHConfiguratorProps = {}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [inchargePeriods, setInchargePeriods] = useState<any[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [showMediaPlan, setShowMediaPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMediaPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { addQuoteItem, createOrGetQuote } = useQuotes();
  const { toast } = useToast();

  // Fetch incharge periods on component mount
  useEffect(() => {
    const fetchInchargePeriods = async () => {
      try {
        const { data, error } = await supabase
          .from('incharge_periods')
          .select('*')
          .order('period_number', { ascending: true });
        
        if (error) throw error;
        setInchargePeriods(data || []);
      } catch (error) {
        console.error('Error fetching incharge periods:', error);
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
    if (selectedValues.length === 0) return;

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
      value: currentQuestion.type === 'multiple' || currentQuestion.type === 'location' || currentQuestion.type === 'periods' ? selectedValues : selectedValues[0],
      scores: combinedScores
    };

    

    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setAnswers(newAnswers);
    setSelectedValues([]);

    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Scroll to top when moving to next question
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowResults(true);
      // Scroll to top when showing results
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const calculateRecommendations = (): OOHRecommendation[] => {
    const formatScores: Record<string, number> = {};
    const formatReasons: Record<string, string[]> = {};

    // Initialize scores
    Object.keys(formatDescriptions).forEach(format => {
      formatScores[format] = 0;
      formatReasons[format] = [];
    });

    // Calculate total scores
    answers.forEach(answer => {
      Object.entries(answer.scores).forEach(([format, score]) => {
        formatScores[format] += score;
      });
    });

    // Generate recommendations with reasons
    const recommendations: OOHRecommendation[] = Object.entries(formatScores)
      .map(([format, score]) => {
        const reasons: string[] = [];
        
        // Add specific reasons based on answers
        const objective = answers.find(a => a.questionId === 'campaign_objective')?.value;
        const budget = answers.find(a => a.questionId === 'budget_range')?.value;
        const audience = answers.find(a => a.questionId === 'target_audience')?.value;
        const urgency = answers.find(a => a.questionId === 'urgency')?.value;

        if (objective === 'awareness' && ['billboards', 'digital_billboards'].includes(format)) {
          reasons.push('Perfect for brand awareness campaigns');
        }
        if (objective === 'local' && ['bus_shelters', 'local_billboards'].includes(format)) {
          reasons.push('Excellent for local presence and community targeting');
        }
        if (budget === 'low' && ['bus_shelters', 'taxi_ads'].includes(format)) {
          reasons.push('Cost-effective option within your budget');
        }
        if (budget === 'premium' && ['digital_billboards', 'billboards'].includes(format)) {
          reasons.push('Premium format that maximizes your budget');
        }
        if (audience === 'commuters' && ['tube_ads', 'taxi_ads'].includes(format)) {
          reasons.push('Reaches your target commuter audience effectively');
        }
        if (urgency === 'urgent' && ['digital_billboards', 'taxi_ads'].includes(format)) {
          reasons.push('Quick setup and deployment possible');
        }

        const formatInfo = formatDescriptions[format as keyof typeof formatDescriptions];
        
        return {
          format,
          score,
          reasons: reasons.length > 0 ? reasons : formatInfo?.strengths.slice(0, 2) || [],
          description: formatInfo?.description || '',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return recommendations;
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
    const creativeAnswer = answers.find(a => a.questionId === 'creative_needs');
    if (!creativeAnswer) return '';
    switch(creativeAnswer.value) {
      case 'ready': return 'Creative assets ready';
      case 'design_help': return 'Need design assistance';
      case 'full_creative': return 'Need full creative development';
      default: return String(creativeAnswer.value);
    }
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedValues([]);
    setShowResults(false);
    setShowQuoteForm(false);
  };

  const getSelectedFormats = (): string[] => {
    const recommendations = calculateRecommendations();
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
    return <QuoteFormSection 
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
    const recommendations = calculateRecommendations();
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your OOH Recommendations</CardTitle>
            <p className="text-muted-foreground">Based on your preferences, here are our top recommendations</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {recommendations.map((rec, index) => {
              const formatInfo = formatDescriptions[rec.format as keyof typeof formatDescriptions];
              return (
                <Card key={rec.format} className={`${index === 0 ? 'border-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{formatInfo?.name}</h3>
                        {index === 0 && <Badge variant="default" className="mt-1">Top Recommendation</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Match Score</div>
                        <div className="text-2xl font-bold text-primary">{Math.round((rec.score / Math.max(...recommendations.map(r => r.score))) * 100)}%</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{rec.description}</p>
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
                    // Create or get quote first
                    await createOrGetQuote();
                    
                    // Get recommendations and add them as quote items
                    const recommendations = calculateRecommendations();
                    const selectedLocations = getSelectedLocations();
                    const selectedPeriods = getSelectedPeriods();
                    
                    // Add quote items for each recommendation
                    for (const rec of recommendations) {
                      const formatInfo = formatDescriptions[rec.format as keyof typeof formatDescriptions];
                      await addQuoteItem({
                        format_name: formatInfo?.name || rec.format,
                        format_slug: rec.format,
                        quantity: 1, // Default quantity
                        selected_periods: selectedPeriods,
                        selected_areas: selectedLocations,
                        production_cost: 0,
                        creative_cost: 0,
                        base_cost: 1000, // Placeholder base cost
                        total_cost: 1000,
                        creative_needs: getCreativeNeeds()
                      });
                    }
                    
                    onComplete?.();
                  } catch (error) {
                    console.error('Error creating quote items:', error);
                  } finally {
                    setIsCreatingQuote(false);
                  }
                }} 
                variant="outline"
                className="flex-1"
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
                {inchargePeriods.map((period) => (
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
                ))}
              </div>
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
          variant="outline"
          onClick={goBack}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button
          onClick={goNext}
          disabled={selectedValues.length === 0}
          className="flex items-center space-x-2"
        >
          <span>{currentQuestionIndex === visibleQuestions.length - 1 ? 'Get Results' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
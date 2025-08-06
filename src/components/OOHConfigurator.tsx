import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Target, Users, MapPin, Clock, DollarSign, Eye, Zap } from 'lucide-react';
import QuoteFormSection from './QuoteFormSection';

interface Answer {
  questionId: string;
  value: string | number | (string | number)[];
  scores: Record<string, number>;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'range' | 'location';
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
    subtitle: 'Understanding your audience helps us recommend the best locations',
    type: 'single',
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
    id: 'campaign_duration',
    title: 'How long will your campaign run?',
    subtitle: 'Campaign length affects format recommendations and pricing',
    type: 'single',
    options: [
      {
        label: '1-2 weeks',
        value: 'short',
        scores: { 'digital_billboards': 9, 'taxi_ads': 8, 'tube_ads': 7, 'bus_shelters': 6, 'billboards': 5 }
      },
      {
        label: '1 month',
        value: 'medium',
        scores: { 'billboards': 8, 'bus_shelters': 8, 'digital_billboards': 7, 'tube_ads': 8, 'taxi_ads': 7 }
      },
      {
        label: '3+ months',
        value: 'long',
        scores: { 'billboards': 9, 'bus_shelters': 9, 'tube_ads': 8, 'digital_billboards': 6, 'taxi_ads': 6 }
      }
    ]
  },
  {
    id: 'preferred_locations',
    title: 'Which London areas are most important?',
    subtitle: 'Select up to 3 priority locations',
    type: 'multiple',
    options: [
      {
        label: 'Central London',
        value: 'central',
        scores: { 'tube_ads': 9, 'billboards': 8, 'digital_billboards': 8, 'bus_shelters': 7, 'taxi_ads': 9 }
      },
      {
        label: 'Financial District',
        value: 'financial',
        scores: { 'tube_ads': 10, 'billboards': 7, 'digital_billboards': 8, 'bus_shelters': 6, 'taxi_ads': 8 }
      },
      {
        label: 'Shopping Districts',
        value: 'shopping',
        scores: { 'bus_shelters': 9, 'digital_billboards': 8, 'billboards': 7, 'tube_ads': 7, 'taxi_ads': 7 }
      },
      {
        label: 'Residential Areas',
        value: 'residential',
        scores: { 'bus_shelters': 10, 'local_billboards': 9, 'taxi_ads': 6, 'tube_ads': 5, 'digital_billboards': 5 }
      },
      {
        label: 'Transport Hubs',
        value: 'transport',
        scores: { 'tube_ads': 10, 'digital_billboards': 9, 'billboards': 6, 'bus_shelters': 8, 'taxi_ads': 7 }
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

export const OOHConfigurator = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

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

  const goNext = () => {
    if (selectedValues.length === 0) return;

    // Calculate scores for this answer
    let combinedScores: Record<string, number> = {};
    
    if (currentQuestion.type === 'multiple') {
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
      value: currentQuestion.type === 'multiple' ? selectedValues : selectedValues[0],
      scores: combinedScores
    };

    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setAnswers(newAnswers);
    setSelectedValues([]);

    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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
    const objective = answers.find(a => a.questionId === 'campaign_objective')?.value;
    switch(objective) {
      case 'awareness': return 'Brand Awareness';
      case 'traffic': return 'Drive Traffic/Sales';
      case 'local': return 'Local Presence';
      case 'event': return 'Event Promotion';
      default: return '';
    }
  };

  const getTargetAudience = (): string => {
    const audience = answers.find(a => a.questionId === 'target_audience')?.value;
    switch(audience) {
      case 'commuters': return 'Commuters & Office Workers';
      case 'shoppers': return 'Shoppers & Consumers';
      case 'tourists': return 'Tourists & Visitors';
      case 'residents': return 'Local Residents';
      case 'young': return 'Young Demographics (18-35)';
      default: return '';
    }
  };

  if (showQuoteForm) {
    return <QuoteFormSection 
      prefilledFormats={getSelectedFormats()}
      budgetRange={getBudgetRange()}
      campaignObjective={getCampaignObjective()}
      targetAudience={getTargetAudience()}
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
              <Button onClick={() => setShowQuoteForm(true)} className="flex-1">
                Get Detailed Quote
              </Button>
            </div>
          </CardContent>
        </Card>
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
          {currentQuestion.options.map((option, index) => {
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
          })}
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
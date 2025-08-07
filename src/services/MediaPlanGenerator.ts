import { Answer } from '@/components/OOHConfigurator';
import { useRateCards } from '@/hooks/useRateCards';
import { InchargePeriod } from '@/hooks/useRateCards';
import { calculateVAT } from '@/utils/vat';

export interface MediaPlanItem {
  formatSlug: string;
  formatName: string;
  recommendedQuantity: number;
  selectedAreas: string[];
  selectedPeriods: number[];
  baseCost: number;
  productionCost: number;
  creativeCost: number;
  totalCost: number;
  budgetAllocation: number; // percentage of total budget
  reasonForRecommendation: string[];
}

export interface GeneratedMediaPlan {
  totalBudget: number;
  totalAllocatedBudget: number;
  remainingBudget: number;
  items: MediaPlanItem[];
  campaignObjective: string;
  targetAudience: string;
  estimatedReach: string;
  campaignDuration: string;
}

export class MediaPlanGenerator {
  private formatSlugs = [
    'billboards',
    'digital_billboards', 
    'rail_advertising',
    'taxi_advertising',
    'bus_advertising',
    'tube_advertising'
  ];

  async generatePlan(
    answers: Answer[],
    inchargePeriods: InchargePeriod[]
  ): Promise<GeneratedMediaPlan | null> {
    try {
      console.log('Generating media plan with answers:', answers);
      console.log('Incharge periods:', inchargePeriods);
      
      const budget = this.getBudgetFromAnswers(answers);
      const recommendations = this.getRecommendationsFromAnswers(answers);
      const selectedAreas = this.getSelectedAreasFromAnswers(answers);
      const objective = this.getCampaignObjectiveFromAnswers(answers);
      const audience = this.getTargetAudienceFromAnswers(answers);
      
      console.log('Extracted data:', { budget, recommendations, selectedAreas, objective, audience });
      
      if (!budget || recommendations.length === 0) {
        console.error('Missing budget or recommendations:', { budget, recommendations });
        return null;
      }

      const planItems: MediaPlanItem[] = [];
      let allocatedBudget = 0;

      // Sort recommendations by score (highest first)
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 2); // Take top 2 recommendations

      console.log('Sorted recommendations:', sortedRecommendations);

      for (let i = 0; i < sortedRecommendations.length; i++) {
        const rec = sortedRecommendations[i];
        const formatSlug = this.getFormatSlug(rec.name);
        
        console.log('Processing recommendation:', rec.name, 'slug:', formatSlug);
        
        if (!formatSlug) continue;

        // Calculate budget allocation (primary gets more)
        const allocationPercentage = i === 0 ? 0.65 : 0.35;
        const itemBudget = budget * allocationPercentage;
        
        const planItem = await this.generatePlanItemForFormat(
          formatSlug,
          rec.name,
          itemBudget,
          selectedAreas,
          inchargePeriods,
          rec.reasons
        );
        
        if (planItem) {
          planItems.push({
            ...planItem,
            budgetAllocation: allocationPercentage * 100
          });
          allocatedBudget += planItem.totalCost;
        }
      }

      console.log('Generated plan items:', planItems);

      return {
        totalBudget: budget,
        totalAllocatedBudget: allocatedBudget,
        remainingBudget: budget - allocatedBudget,
        items: planItems,
        campaignObjective: objective,
        targetAudience: audience,
        estimatedReach: this.calculateEstimatedReach(planItems),
        campaignDuration: this.calculateCampaignDuration(inchargePeriods)
      };
    } catch (error) {
      console.error('Error generating media plan:', error);
      return null;
    }
  }

  private async generatePlanItemForFormat(
    formatSlug: string,
    formatName: string,
    budget: number,
    selectedAreas: string[],
    inchargePeriods: InchargePeriod[],
    reasons: string[]
  ): Promise<Omit<MediaPlanItem, 'budgetAllocation'> | null> {
    
    // Use dynamic import to avoid circular dependencies
    const { useRateCards } = await import('@/hooks/useRateCards');
    
    // This is a simplified version - in real implementation you'd need to:
    // 1. Get rate card data for the format
    // 2. Calculate optimal quantity based on budget
    // 3. Select best periods based on availability
    
    // For now, using placeholder logic
    const defaultQuantity = Math.floor(budget / 3000); // Estimate ~£3k per unit
    const defaultPeriods = inchargePeriods.slice(0, 2).map(p => p.period_number);
    const areas = selectedAreas.length > 0 ? selectedAreas.slice(0, 3) : ['Central London'];
    
    const baseCost = budget * 0.7; // 70% for media
    const productionCost = budget * 0.15; // 15% for production  
    const creativeCost = budget * 0.15; // 15% for creative
    const totalCost = baseCost + productionCost + creativeCost;

    return {
      formatSlug,
      formatName,
      recommendedQuantity: Math.max(1, defaultQuantity),
      selectedAreas: areas,
      selectedPeriods: defaultPeriods,
      baseCost,
      productionCost, 
      creativeCost,
      totalCost,
      reasonForRecommendation: reasons
    };
  }

  private getBudgetFromAnswers(answers: Answer[]): number {
    console.log('Looking for budget in answers:', answers);
    const budgetAnswer = answers.find(a => a.questionId === 'budget' || a.questionId === 'campaign_budget');
    console.log('Found budget answer:', budgetAnswer);
    
    if (!budgetAnswer?.value) return 0;
    
    const budgetStr = budgetAnswer.value as string;
    console.log('Budget string:', budgetStr);
    
    // Handle different budget formats
    if (typeof budgetStr === 'string') {
      const match = budgetStr.match(/£?([\d,]+)/);
      if (match) {
        const budget = parseInt(match[1].replace(/,/g, ''));
        console.log('Parsed budget:', budget);
        return budget;
      }
    }
    
    console.log('Could not parse budget, returning 0');
    return 0;
  }

  private getRecommendationsFromAnswers(answers: Answer[]): Array<{name: string, score: number, reasons: string[]}> {
    console.log('Getting recommendations from answers:', answers);
    
    // Extract format scores from all answers
    const formatScores: Record<string, number> = {};
    const formatReasons: Record<string, string[]> = {};
    
    answers.forEach(answer => {
      console.log('Processing answer:', answer.questionId, answer.scores);
      Object.entries(answer.scores || {}).forEach(([format, score]) => {
        formatScores[format] = (formatScores[format] || 0) + (score as number);
        
        // Add reasoning based on question type
        if (!formatReasons[format]) formatReasons[format] = [];
        if (answer.questionId === 'campaign_objective') {
          formatReasons[format].push(`Aligns with ${answer.value} objective`);
        } else if (answer.questionId === 'target_audience') {
          formatReasons[format].push(`Targets ${answer.value} demographic`);
        } else if (answer.questionId === 'budget' || answer.questionId === 'campaign_budget') {
          formatReasons[format].push(`Fits within ${answer.value} budget range`);
        }
      });
    });

    console.log('Format scores:', formatScores);
    
    const recommendations = Object.entries(formatScores)
      .map(([name, score]) => ({
        name: this.formatDisplayName(name),
        score,
        reasons: formatReasons[name] || [`High compatibility score: ${score}`]
      }))
      .filter(item => item.score > 0);
      
    console.log('Generated recommendations:', recommendations);
    
    return recommendations;
  }

  private getSelectedAreasFromAnswers(answers: Answer[]): string[] {
    const locationAnswer = answers.find(a => a.questionId === 'locations' || a.questionId === 'target_locations');
    console.log('Location answer:', locationAnswer);
    const areas = locationAnswer?.value as string[] || [];
    console.log('Selected areas:', areas);
    return areas;
  }

  private getCampaignObjectiveFromAnswers(answers: Answer[]): string {
    const objectiveAnswer = answers.find(a => a.questionId === 'objective' || a.questionId === 'campaign_objective');
    console.log('Objective answer:', objectiveAnswer);
    return objectiveAnswer?.value as string || 'Brand Awareness';
  }

  private getTargetAudienceFromAnswers(answers: Answer[]): string {
    const audienceAnswer = answers.find(a => a.questionId === 'audience' || a.questionId === 'target_audience');
    console.log('Audience answer:', audienceAnswer);
    return audienceAnswer?.value as string || 'General Public';
  }

  private getFormatSlug(formatName: string): string | null {
    const slugMap: Record<string, string> = {
      'Billboards': 'billboards',
      'Digital Billboards': 'digital_billboards',
      'Rail Advertising': 'rail_advertising', 
      'Taxi Advertising': 'taxi_advertising',
      'Bus Advertising': 'bus_advertising',
      'Tube Advertising': 'tube_advertising'
    };
    return slugMap[formatName] || null;
  }

  private formatDisplayName(slug: string): string {
    const nameMap: Record<string, string> = {
      'billboards': 'Billboards',
      'digital_billboards': 'Digital Billboards',
      'rail_advertising': 'Rail Advertising',
      'taxi_advertising': 'Taxi Advertising', 
      'bus_advertising': 'Bus Advertising',
      'tube_advertising': 'Tube Advertising'
    };
    return nameMap[slug] || slug;
  }

  private calculateEstimatedReach(items: MediaPlanItem[]): string {
    // Simplified reach calculation
    const totalUnits = items.reduce((sum, item) => sum + item.recommendedQuantity, 0);
    const estimatedReach = totalUnits * 50000; // ~50k reach per unit
    return `${(estimatedReach / 1000).toFixed(0)}K people`;
  }

  private calculateCampaignDuration(periods: InchargePeriod[]): string {
    if (periods.length === 0) return '2 weeks';
    const weeks = periods.length;
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
}
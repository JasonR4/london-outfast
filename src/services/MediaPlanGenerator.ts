import { Answer } from '@/components/OOHConfigurator';
import { useRateCards } from '@/hooks/useRateCards';
import { InchargePeriod } from '@/hooks/useRateCards';
import { calculateVAT } from '@/utils/vat';
import { supabase } from '@/integrations/supabase/client';

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
  startDate: string;
  endDate: string;
}

export class MediaPlanGenerator {
  private answers: Answer[] = [];
  
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
      // Store answers for use in helper methods
      this.answers = answers;
      
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

      const campaignDates = this.calculateCampaignDates(inchargePeriods);

      return {
        totalBudget: budget,
        totalAllocatedBudget: allocatedBudget,
        remainingBudget: budget - allocatedBudget,
        items: planItems,
        campaignObjective: objective,
        targetAudience: audience,
        estimatedReach: this.calculateEstimatedReach(planItems),
        campaignDuration: this.calculateCampaignDuration(inchargePeriods),
        startDate: campaignDates.startDate,
        endDate: campaignDates.endDate
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
    
    try {
      // Get actual rate card data for this format
      const { data: mediaFormat } = await supabase
        .from('media_formats')
        .select('*')
        .eq('format_slug', formatSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (!mediaFormat) {
        console.warn(`No media format found for slug: ${formatSlug}`);
        return this.getFallbackPlanItem(formatSlug, formatName, budget, selectedAreas, inchargePeriods, reasons);
      }

      // Get rate cards for this format
      const { data: rateCards } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('media_format_id', mediaFormat.id)
        .eq('is_active', true);

      // Get selected periods from answers
      const selectedPeriods = this.getSelectedPeriodsFromAnswers();
      const periodsCount = selectedPeriods.length || 2; // Default to 2 periods

      // Calculate optimal quantity based on budget and rate cards
      let optimalQuantity = 1;
      let baseCost = 0;
      
      if (rateCards && rateCards.length > 0) {
        // Use first available rate card for estimation
        const rateCard = rateCards[0];
        const baseRate = rateCard.sale_price || rateCard.reduced_price || rateCard.base_rate_per_incharge;
        const markupMultiplier = 1 + (rateCard.location_markup_percentage / 100);
        const adjustedRate = baseRate * markupMultiplier;
        
        // Apply discount tiers
        const { data: discountTiers } = await supabase
          .from('discount_tiers')
          .select('*')
          .eq('media_format_id', mediaFormat.id)
          .eq('is_active', true)
          .lte('min_periods', periodsCount)
          .or(`max_periods.is.null,max_periods.gte.${periodsCount}`)
          .order('discount_percentage', { ascending: false })
          .limit(1);

        const discount = discountTiers?.[0]?.discount_percentage || 0;
        const discountMultiplier = 1 - (discount / 100);
        const finalRate = adjustedRate * discountMultiplier;
        
        // Calculate how many units we can afford for media spend (70% of budget)
        const mediaBudget = budget * 0.7;
        const costPerUnit = finalRate * periodsCount;
        optimalQuantity = Math.max(1, Math.floor(mediaBudget / costPerUnit));
        baseCost = costPerUnit * optimalQuantity;
      } else {
        // Fallback calculation if no rate cards
        baseCost = budget * 0.7;
        optimalQuantity = Math.max(1, Math.floor(baseCost / 3000));
      }

      // Calculate production costs using actual tiers
      const productionCost = await this.calculateProductionCostForFormat(
        mediaFormat.id,
        selectedAreas[0] || 'Central London',
        optimalQuantity,
        budget * 0.15
      );

      // Calculate creative costs using actual tiers
      const creativeCost = await this.calculateCreativeCostForFormat(
        mediaFormat.id,
        selectedAreas[0] || 'Central London',
        optimalQuantity,
        budget * 0.15
      );

      const totalCost = baseCost + productionCost + creativeCost;
      const areas = selectedAreas.length > 0 ? selectedAreas.slice(0, 3) : ['Central London'];

      return {
        formatSlug,
        formatName,
        recommendedQuantity: optimalQuantity,
        selectedAreas: areas,
        selectedPeriods,
        baseCost,
        productionCost,
        creativeCost,
        totalCost,
        reasonForRecommendation: reasons
      };
    } catch (error) {
      console.error('Error generating plan item for format:', formatSlug, error);
      return this.getFallbackPlanItem(formatSlug, formatName, budget, selectedAreas, inchargePeriods, reasons);
    }
  }

  private getFallbackPlanItem(
    formatSlug: string,
    formatName: string,
    budget: number,
    selectedAreas: string[],
    inchargePeriods: InchargePeriod[],
    reasons: string[]
  ): Omit<MediaPlanItem, 'budgetAllocation'> {
    const defaultQuantity = Math.floor(budget / 3000);
    const defaultPeriods = this.getSelectedPeriodsFromAnswers() || inchargePeriods.slice(0, 2).map(p => p.period_number);
    const areas = selectedAreas.length > 0 ? selectedAreas.slice(0, 3) : ['Central London'];
    
    const baseCost = budget * 0.7;
    const productionCost = budget * 0.15;
    const creativeCost = budget * 0.15;
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

  private async calculateProductionCostForFormat(
    mediaFormatId: string,
    locationArea: string,
    quantity: number,
    maxBudget: number
  ): Promise<number> {
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

      return maxBudget; // Fallback to max budget if no tiers found
    } catch (error) {
      console.error('Error calculating production cost:', error);
      return maxBudget;
    }
  }

  private async calculateCreativeCostForFormat(
    mediaFormatId: string,
    locationArea: string,
    quantity: number,
    maxBudget: number
  ): Promise<number> {
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

      return maxBudget; // Fallback to max budget if no tiers found
    } catch (error) {
      console.error('Error calculating creative cost:', error);
      return maxBudget;
    }
  }

  private getBudgetFromAnswers(answers: Answer[]): number {
    console.log('Looking for budget in answers:', answers);
    const budgetAnswer = answers.find(a => a.questionId === 'campaign_budget');
    console.log('Found budget answer:', budgetAnswer);
    
    if (!budgetAnswer?.value) return 0;
    
    const budgetStr = budgetAnswer.value as string;
    console.log('Budget string:', budgetStr);
    
    // Parse user input budget
    if (typeof budgetStr === 'string') {
      // Remove £, commas, and spaces, handle K suffix
      const cleanBudget = budgetStr.replace(/[£,\s]/g, '').toLowerCase();
      
      if (cleanBudget.endsWith('k')) {
        const baseAmount = parseFloat(cleanBudget.replace('k', ''));
        if (!isNaN(baseAmount)) {
          const budget = baseAmount * 1000;
          console.log('Parsed K budget:', budget);
          return budget;
        }
      } else {
        const budget = parseFloat(cleanBudget);
        if (!isNaN(budget)) {
          console.log('Parsed raw budget:', budget);
          return budget;
        }
      }
    }
    
    console.log('Could not parse budget, returning 25000 as default');
    return 25000; // Default fallback
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
    const locationAnswer = answers.find(a => a.questionId === 'preferred_locations');
    console.log('Location answer:', locationAnswer);
    const areas = locationAnswer?.value as string[] || ['Central London'];
    console.log('Selected areas:', areas);
    return areas;
  }

  private getCampaignObjectiveFromAnswers(answers: Answer[]): string {
    const objectiveAnswer = answers.find(a => a.questionId === 'campaign_objective');
    console.log('Objective answer:', objectiveAnswer);
    const objective = objectiveAnswer?.value;
    
    if (Array.isArray(objective)) {
      // Map array values to readable text
      const objectiveMap: Record<string, string> = {
        'awareness': 'Brand Awareness',
        'sales': 'Drive Sales',
        'traffic': 'Increase Traffic',
        'engagement': 'Boost Engagement'
      };
      return objective.map(obj => objectiveMap[obj] || obj).join(' + ');
    }
    
    return objective as string || 'Brand Awareness';
  }

  private getTargetAudienceFromAnswers(answers: Answer[]): string {
    const audienceAnswer = answers.find(a => a.questionId === 'target_audience');
    console.log('Audience answer:', audienceAnswer);
    const audience = audienceAnswer?.value;
    
    if (Array.isArray(audience)) {
      // Map array values to readable text
      const audienceMap: Record<string, string> = {
        'commuters': 'Commuters & Office Workers',
        'shoppers': 'Shoppers & Consumers',
        'tourists': 'Tourists & Visitors',
        'residents': 'Local Residents',
        'young': 'Young Demographics (18-35)'
      };
      return audience.map(aud => audienceMap[aud] || aud).join(' + ');
    }
    
    return audience as string || 'General Public';
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
      'tube_advertising': 'Tube Advertising',
      'tube_ads': 'Tube Advertising',
      'taxi_ads': 'Taxi Advertising',
      'bus_shelters': 'Bus Shelter Advertising',
      'local_billboards': 'Local Billboards'
    };
    return nameMap[slug] || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private calculateEstimatedReach(items: MediaPlanItem[]): string {
    // Simplified reach calculation
    const totalUnits = items.reduce((sum, item) => sum + item.recommendedQuantity, 0);
    const estimatedReach = totalUnits * 50000; // ~50k reach per unit
    return `${(estimatedReach / 1000).toFixed(0)}K people`;
  }

  private calculateCampaignDuration(periods: InchargePeriod[]): string {
    // Get selected periods from answers
    const selectedPeriods = this.getSelectedPeriodsFromAnswers();
    
    if (selectedPeriods.length === 0) return '2 weeks';
    
    // Each incharge period is 2 weeks, so total duration is periods * 2
    const totalWeeks = selectedPeriods.length * 2;
    return `${totalWeeks} ${totalWeeks === 1 ? 'week' : 'weeks'}`;
  }

  private getSelectedPeriodsFromAnswers(): number[] {
    const periodsAnswer = this.answers.find(a => a.questionId === 'campaign_periods');
    const selectedPeriods = periodsAnswer?.value as number[] || [];
    console.log('Selected periods from answers:', selectedPeriods);
    return selectedPeriods;
  }

  private calculateCampaignDates(inchargePeriods: InchargePeriod[]): { startDate: string; endDate: string } {
    const selectedPeriods = this.getSelectedPeriodsFromAnswers();
    
    if (selectedPeriods.length === 0 || inchargePeriods.length === 0) {
      return {
        startDate: 'TBC',
        endDate: 'TBC'
      };
    }

    // Find the periods that match selected period numbers
    const matchingPeriods = inchargePeriods.filter(period => 
      selectedPeriods.includes(period.period_number)
    );

    if (matchingPeriods.length === 0) {
      return {
        startDate: 'TBC',
        endDate: 'TBC'
      };
    }

    // Sort by period number to get start and end dates
    const sortedPeriods = matchingPeriods.sort((a, b) => a.period_number - b.period_number);
    const startDate = sortedPeriods[0].start_date;
    const endDate = sortedPeriods[sortedPeriods.length - 1].end_date;

    // Format dates nicely
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }
}
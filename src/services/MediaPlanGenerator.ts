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
      const selectedAreas = this.getSelectedAreasFromAnswers(answers);
      const objective = this.getCampaignObjectiveFromAnswers(answers);
      const audience = this.getTargetAudienceFromAnswers(answers);
      
      console.log('Extracted data:', { budget, selectedAreas, objective, audience });
      
      if (!budget) {
        console.error('Missing budget:', { budget });
        return null;
      }

      // Get recommendations using the same logic as OOH configurator
      const recommendations = await this.generateRecommendationsFromAnswers(answers, budget);
      console.log('Generated recommendations:', recommendations);

      if (recommendations.length === 0) {
        console.error('No recommendations generated');
        return null;
      }

      const planItems: MediaPlanItem[] = [];
      let allocatedBudget = 0;

      // Convert recommendations to plan items
      for (let i = 0; i < Math.min(recommendations.length, 2); i++) {
        const rec = recommendations[i];
        
        // Calculate budget allocation (primary gets more, but never exceed total budget)
        const allocationPercentage = i === 0 ? 0.65 : 0.35;
        const maxItemBudget = budget * allocationPercentage;
        
        // Ensure the recommendation doesn't exceed the allocated budget
        const actualBudget = Math.min(rec.budgetAllocation || maxItemBudget, maxItemBudget);
        
        const planItem: MediaPlanItem = {
          formatSlug: rec.format,
          formatName: rec.formatName,
          recommendedQuantity: rec.calculatedQuantity || 1,
          selectedAreas: selectedAreas, // Use ALL selected areas, not just slice(0, 3)
          selectedPeriods: this.getSelectedPeriodsFromAnswers(),
          baseCost: actualBudget * 0.7, // 70% for media
          productionCost: actualBudget * 0.15, // 15% for production
          creativeCost: actualBudget * 0.15, // 15% for creative
          totalCost: actualBudget,
          budgetAllocation: allocationPercentage * 100,
          reasonForRecommendation: rec.reasons
        };
        
        planItems.push(planItem);
        allocatedBudget += planItem.totalCost;
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

  private async generateRecommendationsFromAnswers(answers: Answer[], budget: number) {
    try {
      // Get actual media formats from database
      const { data: mediaFormats } = await supabase
        .from('media_formats')
        .select('*')
        .eq('is_active', true);

      if (!mediaFormats) return [];

      // Get selected periods
      const selectedPeriods = this.getSelectedPeriodsFromAnswers();
      const periodsCount = selectedPeriods.length || 2;

      const formatScores: Record<string, number> = {};

      // Initialize scores for actual media formats
      mediaFormats.forEach(format => {
        formatScores[format.format_slug] = 0;
      });

      // Calculate total scores from answers (map old slugs to new ones where possible)
      answers.forEach(answer => {
        Object.entries(answer.scores).forEach(([format, score]) => {
          // Map old format slugs to new ones
          const mappedFormat = this.mapFormatSlug(format);
          if (formatScores.hasOwnProperty(mappedFormat)) {
            formatScores[mappedFormat] += score;
          }
        });
      });

      // Get top scoring formats
      const topFormats = Object.entries(formatScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      const recommendations = [];
      
      // Split budget between top recommendations
      const budgetPerRecommendation = Math.floor(budget / Math.min(topFormats.length, 2)); // Split between top 2

      for (let i = 0; i < topFormats.length && i < 2; i++) {
        const [formatSlug, score] = topFormats[i];
        const mediaFormat = mediaFormats.find(f => f.format_slug === formatSlug);
        if (!mediaFormat) continue;

        // Use split budget allocation for each recommendation
        const allocatedBudget = i === 0 ? Math.floor(budget * 0.65) : Math.floor(budget * 0.35); // 65/35 split
        const costData = await this.calculateRealCosts(mediaFormat.id, allocatedBudget, periodsCount);
        
        recommendations.push({
          format: formatSlug,
          formatName: mediaFormat.format_name,
          score,
          reasons: [`Optimized for your ${this.getCampaignObjectiveFromAnswers(answers)} objective`],
          description: mediaFormat.description || '',
          calculatedQuantity: costData.quantity,
          budgetAllocation: costData.totalCost,
          costPerUnit: costData.costPerUnit
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
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


  private getSelectedAreasFromAnswers(answers: Answer[]): string[] {
    const locationAnswer = answers.find(a => a.questionId === 'preferred_locations');
    console.log('Location answer:', locationAnswer);
    
    // Ensure we get ALL selected areas, not just a default
    const areas = Array.isArray(locationAnswer?.value) ? locationAnswer.value as string[] : 
                  locationAnswer?.value ? [locationAnswer.value as string] : ['Central London'];
    
    console.log('All selected areas:', areas);
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

  private mapFormatSlug(oldSlug: string): string {
    const mapping: Record<string, string> = {
      'billboards': '48-sheet-billboard',
      'digital_billboards': 'digital-48-sheet',
      'tube_ads': '6-sheet-tube-panel', // Map to most common tube format
      'taxi_ads': 'taxi-advertising',
      'bus_shelters': 'bus-shelter-supersites',
      'local_billboards': 'lamp-post-banners'
    };
    return mapping[oldSlug] || oldSlug;
  }

  private async calculateRealCosts(mediaFormatId: string, totalBudget: number, periodsCount: number) {
    try {
      // Get rate cards for this format
      const { data: rateCards } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('media_format_id', mediaFormatId)
        .eq('is_active', true)
        .limit(1);

      if (!rateCards || rateCards.length === 0) {
        // Fallback: keep within budget constraints
        const maxQuantity = Math.floor(totalBudget / 3000);
        return {
          quantity: Math.max(1, maxQuantity),
          totalCost: Math.min(totalBudget, maxQuantity * 3000),
          costPerUnit: 3000
        };
      }

      const rateCard = rateCards[0];
      const baseRate = rateCard.sale_price || rateCard.reduced_price || rateCard.base_rate_per_incharge;
      const markupMultiplier = 1 + (rateCard.location_markup_percentage / 100);
      const adjustedRate = baseRate * markupMultiplier;

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
      
      // Calculate quantity that fits within budget constraints
      const maxQuantity = Math.floor(totalBudget / costPerUnit);
      const quantity = Math.max(1, maxQuantity);
      const totalCost = Math.min(totalBudget, costPerUnit * quantity);

      return {
        quantity,
        totalCost,
        costPerUnit
      };
    } catch (error) {
      console.error('Error calculating real costs:', error);
      const fallbackQuantity = Math.floor(totalBudget / 3000);
      return {
        quantity: Math.max(1, fallbackQuantity),
        totalCost: Math.min(totalBudget, fallbackQuantity * 3000),
        costPerUnit: 3000
      };
    }
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
import { useMemo } from 'react';

interface CreativeUpsellOption {
  title: string;
  description: string;
  currentValue: number;
  suggestedValue: number;
  costIncrease: number;
  percentageIncrease: number;
  benefitText: string;
  type: 'sites' | 'creatives';
}

interface CreativeCapacityProps {
  sites: number;
  creativeAssets: number;
  needsCreative: boolean;
  creativeCostPerAsset?: number;
  siteCost?: number;
}

export const useCreativeCapacity = ({
  sites,
  creativeAssets,
  needsCreative,
  creativeCostPerAsset = 85,
  siteCost = 1000
}: CreativeCapacityProps) => {
  
  const calculations = useMemo(() => {
    if (!needsCreative) {
      return {
        isOptimal: true,
        efficiency: 100,
        status: 'not-needed' as const,
        recommendation: null,
        creativesPerSite: 0,
        sitesPerCreative: 0
      };
    }

    const creativesPerSite = creativeAssets / sites;
    const sitesPerCreative = sites / creativeAssets;
    
    // Determine efficiency and recommendations
    let status: 'optimal' | 'under-creative' | 'over-creative' | 'warning';
    let recommendation: string | null = null;
    let efficiency = 100;

    if (creativesPerSite < 0.5) {
      // Too few creatives for sites (e.g., 1 creative for 7 sites)
      status = 'under-creative';
      efficiency = Math.round((creativesPerSite / 0.5) * 100);
      recommendation = `You have ${sites} sites but only ${creativeAssets} creative${creativeAssets > 1 ? 's' : ''}. Each creative will be stretched across ${sitesPerCreative.toFixed(1)} sites, potentially reducing campaign effectiveness.`;
    } else if (creativesPerSite > 2) {
      // Too many creatives for sites (e.g., 10 creatives for 3 sites)
      status = 'over-creative';
      efficiency = Math.round((2 / creativesPerSite) * 100);
      recommendation = `You have ${creativeAssets} creatives for only ${sites} sites. This is over-optimization that increases costs without proportional benefit.`;
    } else if (creativesPerSite >= 0.5 && creativesPerSite <= 1) {
      // Good ratio
      status = 'optimal';
      recommendation = `Excellent! Your ${creativeAssets} creative${creativeAssets > 1 ? 's' : ''} provide optimal coverage for ${sites} sites.`;
    } else {
      // Decent but could be optimized
      status = 'warning';
      efficiency = 85;
      recommendation = `Good coverage with ${creativesPerSite.toFixed(1)} creatives per site. Consider optimizing for better efficiency.`;
    }

    const isOptimal = status === 'optimal';

    return {
      isOptimal,
      efficiency,
      status,
      recommendation,
      creativesPerSite,
      sitesPerCreative
    };
  }, [sites, creativeAssets, needsCreative]);

  const generateCreativeUpsellOptions = (): CreativeUpsellOption[] => {
    if (!needsCreative || calculations.isOptimal) return [];

    const options: CreativeUpsellOption[] = [];

    if (calculations.status === 'under-creative') {
      // Suggest more creatives (ONLY increases)
      const optimalCreatives = Math.ceil(sites * 0.5); // 1 creative per 2 sites minimum
      const betterCreatives = sites; // 1:1 ratio
      
      if (optimalCreatives > creativeAssets) {
        const creativeIncrease = optimalCreatives - creativeAssets;
        const costIncrease = creativeIncrease * creativeCostPerAsset;
        const currentCost = creativeAssets * creativeCostPerAsset;
        const percentageIncrease = Math.round((costIncrease / currentCost) * 100);

        options.push({
          title: `Add ${creativeIncrease} More Creative${creativeIncrease > 1 ? 's' : ''}`,
          description: `Increase from ${creativeAssets} to ${optimalCreatives} creatives for better site coverage`,
          currentValue: creativeAssets,
          suggestedValue: optimalCreatives,
          costIncrease,
          percentageIncrease,
          benefitText: `Achieve 1 creative per 2 sites for optimal frequency and variety`,
          type: 'creatives'
        });
      }

      if (betterCreatives > optimalCreatives) {
        const creativeIncrease = betterCreatives - creativeAssets;
        const costIncrease = creativeIncrease * creativeCostPerAsset;
        const currentCost = creativeAssets * creativeCostPerAsset;
        const percentageIncrease = Math.round((costIncrease / currentCost) * 100);

        options.push({
          title: `Premium: 1:1 Creative-to-Site Ratio`,
          description: `Upgrade to ${betterCreatives} creatives for maximum campaign variety`,
          currentValue: creativeAssets,
          suggestedValue: betterCreatives,
          costIncrease,
          percentageIncrease,
          benefitText: `Each site gets unique creative for maximum audience engagement`,
          type: 'creatives'
        });
      }
    }

    if (calculations.status === 'over-creative') {
      // Suggest more sites to match the creatives (ONLY increases)
      const optimalSites = Math.ceil(creativeAssets / 2); // Max 2 creatives per site
      if (optimalSites > sites) {
        const siteIncrease = optimalSites - sites;
        const costIncrease = siteIncrease * siteCost;
        const currentCost = sites * siteCost;
        const percentageIncrease = Math.round((costIncrease / currentCost) * 100);

        options.push({
          title: `Scale Up: Add ${siteIncrease} More Site${siteIncrease > 1 ? 's' : ''}`,
          description: `Increase to ${optimalSites} sites to maximize your ${creativeAssets} creative investment`,
          currentValue: sites,
          suggestedValue: optimalSites,
          costIncrease,
          percentageIncrease,
          benefitText: `Maximize your creative ROI with broader reach and coverage`,
          type: 'sites'
        });
      }
    }

    // Sort by cost efficiency (lowest percentage increase first)
    return options.sort((a, b) => a.percentageIncrease - b.percentageIncrease);
  };

  const getCreativeRecommendations = (): string[] => {
    if (!needsCreative) return [];

    const recommendations: string[] = [];

    if (calculations.recommendation) {
      recommendations.push(calculations.recommendation);
    }

    // Add specific tactical recommendations focused on growth
    switch (calculations.status) {
      case 'under-creative':
        recommendations.push(`Industry best practice: 1 creative per 1-2 sites for optimal frequency without oversaturation.`);
        recommendations.push(`Consider adding more creatives to maximize campaign impact and audience engagement.`);
        break;
      case 'over-creative':
        recommendations.push(`You have excellent creative assets! Consider scaling up sites to maximize their potential reach.`);
        recommendations.push(`More sites means broader market penetration with your premium creative content.`);
        break;
      case 'optimal':
        recommendations.push(`Your creative strategy maximizes both reach and frequency for optimal campaign performance.`);
        break;
    }

    return recommendations;
  };

  return {
    ...calculations,
    generateCreativeUpsellOptions,
    getCreativeRecommendations
  };
};
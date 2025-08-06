import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Palette, AlertTriangle, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface CreativeCapacityIndicatorProps {
  sites: number;
  creativeAssets: number;
  needsCreative: boolean;
  efficiency: number;
  status: 'optimal' | 'under-creative' | 'over-creative' | 'warning' | 'not-needed';
  creativesPerSite: number;
  recommendations: string[];
  onOptimizeClick: () => void;
}

export const CreativeCapacityIndicator: React.FC<CreativeCapacityIndicatorProps> = ({
  sites,
  creativeAssets,
  needsCreative,
  efficiency,
  status,
  creativesPerSite,
  recommendations,
  onOptimizeClick
}) => {
  if (!needsCreative) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'optimal':
        return {
          icon: CheckCircle,
          color: 'text-primary',
          bgColor: 'bg-primary/5 border-primary/20',
          badge: 'Optimal',
          badgeVariant: 'default' as const
        };
      case 'under-creative':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/5 border-destructive/20',
          badge: 'Under-Creative',
          badgeVariant: 'destructive' as const
        };
      case 'over-creative':
        return {
          icon: TrendingUp,
          color: 'text-primary',
          bgColor: 'bg-primary/5 border-primary/20',
          badge: 'Over-Creative',
          badgeVariant: 'secondary' as const
        };
      case 'warning':
        return {
          icon: Target,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20 border-border',
          badge: 'Can Optimize',
          badgeVariant: 'outline' as const
        };
      default:
        return {
          icon: Palette,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20 border-border',
          badge: 'Standard',
          badgeVariant: 'outline' as const
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`${statusConfig.bgColor} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
            Creative Strategy Analysis
          </div>
          <Badge variant={statusConfig.badgeVariant}>
            {statusConfig.badge}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Creative-to-Site Ratio Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Creative Efficiency</span>
            <span className="font-medium">{efficiency}%</span>
          </div>
          <Progress value={efficiency} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{creativeAssets} creative{creativeAssets !== 1 ? 's' : ''}</span>
            <span>{sites} site{sites !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Ratio Display */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="font-semibold text-lg">{creativesPerSite.toFixed(2)}</div>
            <div className="text-muted-foreground text-xs">Creatives per Site</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="font-semibold text-lg">{(sites / creativeAssets).toFixed(1)}</div>
            <div className="text-muted-foreground text-xs">Sites per Creative</div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Smart Recommendations:</h4>
            <div className="space-y-1">
              {recommendations.slice(0, 2).map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground leading-relaxed">
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Optimize Button */}
        {status !== 'optimal' && (
          <div className="pt-2 border-t border-border">
            <button
              onClick={onOptimizeClick}
              className="w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
            >
              <Target className="h-3 w-3" />
              View Optimization Options
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface LocationCapacityIndicatorProps {
  capacity: number;
  used: number;
  status: 'available' | 'warning' | 'at-limit' | 'over-limit';
}

export const LocationCapacityIndicator: React.FC<LocationCapacityIndicatorProps> = ({
  capacity,
  used,
  status
}) => {
  const percentage = Math.min((used / capacity) * 100, 100);
  
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          text: 'Available capacity',
          variant: 'default' as const
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          icon: AlertTriangle,
          text: 'Near capacity',
          variant: 'secondary' as const
        };
      case 'at-limit':
        return {
          color: 'bg-orange-500',
          icon: TrendingUp,
          text: 'At capacity',
          variant: 'outline' as const
        };
      case 'over-limit':
        return {
          color: 'bg-red-500',
          icon: AlertTriangle,
          text: 'Over capacity',
          variant: 'destructive' as const
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: CheckCircle,
          text: 'Unknown status',
          variant: 'default' as const
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">Location Capacity</span>
          </div>
          <Badge variant={config.variant}>
            {config.text}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used: {used} of {capacity} slots</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {status === 'available' && `${capacity - used} location slots remaining`}
            {status === 'warning' && `Only ${capacity - used} slots left - consider upgrading for more coverage`}
            {status === 'at-limit' && `Perfect! Maximum location coverage achieved`}
            {status === 'over-limit' && `${used - capacity} locations exceed capacity - upgrade needed`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
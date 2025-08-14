import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AnalyticsSetup() {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addGoogleAnalytics = async () => {
    if (!trackingId.trim()) {
      toast({
        title: 'Missing Tracking ID',
        description: 'Please enter your Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)',
        variant: 'destructive'
      });
      return;
    }

    setIsAdding(true);
    try {
      const trackingCode = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}', {
    enhanced_ecommerce: true,
    allow_enhanced_conversions: true
  });
</script>`;

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_codes')
        .insert({
          name: 'Google Analytics 4',
          code_type: 'google_analytics',
          tracking_code: trackingCode,
          placement: 'head',
          priority: 1,
          is_active: true,
          description: `Google Analytics tracking with ID: ${trackingId}`,
          created_by: user?.id || '',
          updated_by: user?.id || ''
        });

      if (error) throw error;

      toast({
        title: 'Analytics Added!',
        description: 'Google Analytics tracking has been added and will start collecting revenue data.',
      });

      setTrackingId('');
      
      // Refresh the page to load analytics
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Analytics Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No analytics tracking codes are currently configured. To see revenue data in your analytics, 
              you need to add your Google Analytics tracking ID.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking-id">Google Analytics Measurement ID</Label>
              <Input
                id="tracking-id"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Find this in your Google Analytics property settings
              </p>
            </div>

            <Button 
              onClick={addGoogleAnalytics}
              disabled={isAdding || !trackingId.trim()}
              className="w-full"
            >
              {isAdding ? 'Adding Analytics...' : 'Add Google Analytics'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">What happens next:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Google Analytics will be added to all pages</li>
              <li>• Revenue tracking will start immediately</li>
              <li>• Quote submissions will be tracked as conversions</li>
              <li>• E-commerce revenue data will populate your GA4 reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
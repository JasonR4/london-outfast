import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal, calcDeal } from "@/utils/dealCalculations";
import { formatGBP } from "@/lib/pricingMath";
import { track } from "@/utils/analytics";

interface DealContactFormProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export const DealContactForm = ({ deal, isOpen, onClose, user }: DealContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const calc = calcDeal(deal);
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    company: '',
    website: '',
    message: `I want to secure "${deal.title}" for periods ${deal.periods.map(p => p.code).join(', ')}.\n\nTotal value: ${formatGBP(calc.totals.grandTotal)}\n\nLine items:\n${calc.lines.map(l => 
      `- ${l.format_name} (${l.media_owner}): ${l.qty} panels in ${l.area}`
    ).join('\n')}`
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.company) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create quote record
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user?.id,
          status: 'draft',
          user_session_id: deal.slug,
          contact_name: `${formData.firstName} ${formData.lastName}`,
          contact_email: formData.email,
          contact_phone: formData.phone,
          contact_company: formData.company,
          website: formData.website,
          subtotal: calc.totals.mediaDeal,
          total_cost: calc.totals.grandTotal,
          total_inc_vat: calc.totals.grandTotal * 1.2,
          vat_amount: calc.totals.grandTotal * 0.2,
          additional_requirements: formData.message
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const itemsPayload = calc.lines.map(line => ({
        quote_id: quote.id,
        format_name: line.format_name,
        format_slug: line.format_slug,
        quantity: line.qty,
        selected_areas: [line.area],
        selected_periods: deal.periods.map((_, i) => i + 1),
        base_cost: line.perPanelRateCard,
        production_cost: line.productionTotal,
        total_cost: line.lineSubtotal,
        creative_needs: `${line.media_owner} - ${line.area}`
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // Sync to HubSpot
      const { error: hubspotError } = await supabase.functions.invoke('sync-hubspot-contact', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          website: formData.website,
          message: formData.message,
          quoteId: quote.id,
          dealValue: calc.totals.grandTotal,
          dealTitle: deal.title,
          dealPeriods: deal.periods.map(p => p.code).join(', '),
          source: 'deal_contact_form'
        }
      });

      if (hubspotError) {
        console.error('HubSpot sync error:', hubspotError);
        // Don't fail the whole process if HubSpot sync fails
      }

      // Analytics tracking
      track('deal_contact_submitted', {
        deal_slug: deal.slug,
        value: calc.totals.grandTotal,
        discount_pct: deal.discount_pct,
        quote_id: quote.id
      });

      setIsSubmitted(true);
      toast({
        title: "Deal secured!",
        description: "We'll be in touch within 24 hours to confirm your booking.",
      });

    } catch (error) {
      console.error('Error submitting deal contact:', error);
      toast({
        title: "Error",
        description: "Failed to secure deal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deal Secured!</h3>
            <p className="text-muted-foreground mb-4">
              We've received your request for "{deal.title}" and will be in touch within 24 hours to confirm your booking.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Secure Your Deal</DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-lg">{deal.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              <p>Periods: {deal.periods.map(p => p.code).join(', ')}</p>
              <p className="font-semibold text-primary">Total: {formatGBP(calc.totals.grandTotal)}</p>
            </div>
          </CardHeader>
          
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www."
                />
              </div>
              
              <div>
                <Label htmlFor="message">Additional Requirements</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Securing Deal...
                    </>
                  ) : (
                    'Secure Deal'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
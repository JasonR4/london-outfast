import { useState } from 'react';
import { formatCurrencyWithVAT } from '@/utils/vat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileCheck, 
  Download, 
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  PenTool,
  Users
} from 'lucide-react';

interface ContractAgreementsProps {
  quote: any;
  onStatusUpdate: () => void;
}

export function ContractAgreements({ quote, onStatusUpdate }: ContractAgreementsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const contractDetails = quote.contract_details || {};

  // Calculate deposit (typically 50% of total including VAT)
  const totalIncVat = quote.total_inc_vat || quote.total_cost * 1.2;
  const depositAmount = totalIncVat * 0.5;
  const remainingAmount = totalIncVat - depositAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                Contract & Agreements
              </CardTitle>
              <CardDescription>
                Your approved campaign contract and payment information
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-500">
              Approved - Contract Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Approved:</span>
                <span>{formatDate(quote.approved_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Contract ID:</span>
                <span className="font-mono">CT-{quote.id.slice(0, 8)}...</span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right space-y-1">
                <div className="text-lg text-muted-foreground">
                  {formatCurrency(quote.total_cost)} <span className="text-sm">exc VAT</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyWithVAT(quote.total_inc_vat || quote.total_cost * 1.2, true)}
                </div>
                <div className="text-sm text-muted-foreground">Total Contract Value</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Documents
          </CardTitle>
          <CardDescription>
            Download and review your campaign contract documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Media Campaign Contract</h4>
                  <p className="text-sm text-muted-foreground">Full terms and conditions</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Media Schedule</h4>
                  <p className="text-sm text-muted-foreground">Detailed posting schedule</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Creative Specifications</h4>
                  <p className="text-sm text-muted-foreground">Artwork requirements</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Insurance Certificate</h4>
                  <p className="text-sm text-muted-foreground">Campaign coverage details</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Payment schedule and billing details for your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Payment Schedule */}
            <div>
              <h4 className="font-semibold mb-4">Payment Schedule</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-orange-900">Deposit (50%)</h5>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Due Now
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-orange-900 mb-2">
                      {formatCurrency(depositAmount)}
                    </div>
                    <p className="text-sm text-orange-700">
                      Required to secure your campaign dates and begin production
                    </p>
                    <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Deposit
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-blue-900">Final Payment (50%)</h5>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Due Before Launch
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      {formatCurrency(remainingAmount)}
                    </div>
                    <p className="text-sm text-blue-700">
                      Due 7 days before campaign launch date
                    </p>
                    <Button variant="outline" className="w-full mt-4" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Payment Due Later
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold mb-3">Accepted Payment Methods</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">Card Payment</div>
                    <div className="text-xs text-muted-foreground">Visa, Mastercard, Amex</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-xs text-muted-foreground">Direct to account</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <PenTool className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-medium">Company Cheque</div>
                    <div className="text-xs text-muted-foreground">Made payable to us</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Timeline
          </CardTitle>
          <CardDescription>
            Key dates and milestones for your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Contract Signed</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(quote.approved_at)} - Campaign approved and contract ready
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg bg-orange-50">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Deposit Payment</div>
                <div className="text-sm text-muted-foreground">
                  Due now - {formatCurrency(depositAmount)} to secure campaign
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <PenTool className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Creative Submission</div>
                <div className="text-sm text-muted-foreground">
                  Artwork due 14 days before campaign launch
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Final Payment</div>
                <div className="text-sm text-muted-foreground">
                  Due 7 days before launch - {formatCurrency(remainingAmount)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Campaign Launch</div>
                <div className="text-sm text-muted-foreground">
                  Campaign goes live as per schedule
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>
            Important contract terms and campaign policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h5 className="font-semibold mb-2">Payment Terms</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 50% deposit required to secure booking</li>
                <li>• Final payment due 7 days before campaign launch</li>
                <li>• Late payments may result in campaign delays</li>
                <li>• All payments are non-refundable once campaign begins</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Campaign Changes</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Changes to approved schedule subject to availability</li>
                <li>• Additional costs may apply for schedule modifications</li>
                <li>• Creative changes must be submitted 7 days before launch</li>
                <li>• Cancellations after deposit may incur charges</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Campaign Delivery</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Proof of posting provided within 48 hours of launch</li>
                <li>• Weekly reporting on campaign performance</li>
                <li>• End of campaign summary and analytics</li>
                <li>• Insurance coverage included for all placements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Calendar, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { content, loading } = useHomepageContent('contact');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    urgency: 'standard'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 2 hours during business hours.",
    });
    setFormData({ name: '', email: '', phone: '', company: '', message: '', urgency: 'standard' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 text-lg px-6 py-2 shadow-glow">
            {content?.hero?.badge_text || "GET IN TOUCH"}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            {content?.hero?.title || "LET'S TALK MEDIA"}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {content?.hero?.description || "From quick quotes to complex campaigns. We're here to get your brand seen across London."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 shadow-glow">
              <Phone className="w-5 h-5 mr-2" />
              Call Now: +44 204 524 3019
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Calendar className="w-5 h-5 mr-2" />
              Book a Meeting
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {content?.methods?.badge_text || "MULTIPLE WAYS TO REACH US"}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {content?.methods?.title || "Choose Your Preferred Contact Method"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Urgent Enquiries */}
            <Card className="hover-scale group border-london-red/20 hover:border-london-red/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-london-red to-london-red/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Urgent Enquiries</h3>
                <p className="text-muted-foreground mb-4">Campaign live tomorrow? We've got you covered.</p>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  +44 204 524 3019
                </Button>
              </CardContent>
            </Card>

            {/* General Enquiries */}
            <Card className="hover-scale group border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">General Enquiries</h3>
                <p className="text-muted-foreground mb-4">Standard quotes and information requests.</p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@mediabuyinglondon.co.uk
                </Button>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="hover-scale group border-accent/20 hover:border-accent/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">Instant responses during business hours.</p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Office Visit */}
            <Card className="hover-scale group border-secondary/20 hover:border-secondary/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Office Visit</h3>
                <p className="text-muted-foreground mb-4">Face-to-face meetings in Central London.</p>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Badge variant="secondary" className="mb-4">SEND MESSAGE</Badge>
                  <h3 className="text-2xl font-bold mb-2">Get Your Quote Started</h3>
                  <p className="text-muted-foreground">Tell us about your campaign and we'll get back to you within 2 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="urgency">How urgent is your campaign?</Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({...prev, urgency: e.target.value}))}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="standard">Standard (1-2 weeks)</option>
                      <option value="urgent">Urgent (This week)</option>
                      <option value="asap">ASAP (Tomorrow)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell us about your campaign *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                      required
                      rows={4}
                      className="mt-1"
                      placeholder="What format? Which areas? What budget? Any specific requirements?"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full shadow-glow">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Office Hours */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Office Hours</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="text-foreground font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-foreground font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-muted-foreground">Closed</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-london-red font-medium">
                        Emergency campaigns: Available 24/7 by phone
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Our Location</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      {content?.location?.address || "Central London Office"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {content?.location?.details || "Private meeting rooms available for campaign planning sessions. Street parking and tube stations nearby."}
                    </p>
                    <Button variant="outline" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Response Times */}
              <Card className="border-accent/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Response Times</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-london-red rounded-full mr-3"></div>
                      <span className="text-sm"><strong>Urgent campaigns:</strong> 30 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                      <span className="text-sm"><strong>Quote requests:</strong> 2 hours</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
                      <span className="text-sm"><strong>General enquiries:</strong> Same day</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {content?.cta?.title || "Ready to Get Started?"}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {content?.cta?.description || "Join hundreds of brands who trust us with their London OOH campaigns."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Phone className="w-5 h-5 mr-2" />
              Call: +44 204 524 3019
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
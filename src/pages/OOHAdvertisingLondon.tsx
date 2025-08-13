import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateMetaTags } from '@/utils/seo';

const OOHAdvertisingLondon = () => {
  useEffect(() => {
    updateMetaTags(
      'OOH Advertising London | Targeted Outdoor & Digital Campaigns',
      'Reach millions with high-impact OOH Ads in London. Do it fast, data-led, and wherever your audience gathers. Same-day quotes and unbeatable rates.',
      'https://mediabuyinglondon.co.uk/ooh-advertising-london'
    );
  }, []);

  const formats = [
    {
      title: "Tube & Rail",
      description: "Corridor posters, car panels, station dominations with huge dwell time.",
      icon: "🚇"
    },
    {
      title: "Digital Street Furniture & Billboards",
      description: "High-impact digital displays on streets and kiosks.",
      icon: "📺"
    },
    {
      title: "Taxi & Transit Advertising",
      description: "Mobile wraps that follow commuters across the city.",
      icon: "🚖"
    },
    {
      title: "Iconic Landmark Sites",
      description: "Piccadilly Lights, flagship screens at major junctions.",
      icon: "✨"
    }
  ];

  const pricingData = [
    { format: "Tube Car Panels (per panel)", price: "From £18" },
    { format: "Tube Posters", price: "From £750" },
    { format: "Bus Supersides (10 units)", price: "£4,000" },
    { format: "Taxi Wraps (5–10 cabs)", price: "From £3,000" },
    { format: "Traditional Billboards", price: "£250–£520 (6–48 sheets)" },
    { format: "Digital Billboards", price: "£1,000+ per week" }
  ];

  const faqItems = [
    {
      question: "What formats does OOH advertising in London include?",
      answer: "Posters, digital screens, Tube advertising, bus sides, taxi liveries, landmark screens."
    },
    {
      question: "How much does OOH advertising cost?",
      answer: "From £18 for a small Tube panel to several thousand pounds for buses or digital billboards."
    },
    {
      question: "Can I target specific areas of London?",
      answer: "Yes. We offer borough-level targeting and zone-specific planning."
    },
    {
      question: "How long do campaigns typically last?",
      answer: "Two-week minimum campaigns are standard; brand awareness campaigns often run longer."
    },
    {
      question: "What's the benefit of digital (DOOH) vs static OOH?",
      answer: "DOOH offers creative flexibility, real-time updates, and dynamic targeting."
    }
  ];

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>OOH Advertising London | Targeted Outdoor & Digital Campaigns</title>
        <meta name="description" content="Reach millions with high-impact OOH Ads in London. Do it fast, data-led, and wherever your audience gathers. Same-day quotes and unbeatable rates." />
        <meta name="keywords" content="ooh advertising london, outdoor advertising london, digital ooh london, tube advertising, billboard advertising london" />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/ooh-advertising-london" />
        <meta property="og:title" content="OOH Advertising London | Targeted Outdoor & Digital Campaigns" />
        <meta property="og:description" content="Reach millions with high-impact OOH Ads in London. Do it fast, data-led, and wherever your audience gathers." />
        <meta property="og:url" content="https://mediabuyinglondon.co.uk/ooh-advertising-london" />
        <meta name="twitter:title" content="OOH Advertising London | Targeted Outdoor & Digital Campaigns" />
        <meta name="twitter:description" content="Reach millions with high-impact OOH Ads in London. Do it fast, data-led, and wherever your audience gathers." />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="relative bg-gradient-hero text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              OOH Advertising London
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Out-of-Home Advertising That Moves Markets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/quote">Get Same-Day Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                <Link to="/brief">Submit Brief</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why OOH Works Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why OOH Advertising in London Works
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-muted-foreground mb-6">
                  London is one of the most visible advertising markets in the world. With dense footfall, 
                  high-income commuters, and massive transit audience volumes, the impact of OOH is undeniable:
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    The UK's OOH revenue hit a record <strong>£1.4 billion in 2024</strong>, with 66% from DOOH (Digital OOH).
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    A staggering <strong>98% of the UK population</strong> sees OOH ads weekly—unmatched reach.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    London alone commands <strong>25–50% of UK OOH spend</strong>, owning half of the nation's ad panels (~225,000).
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img 
                  src="/src/assets/london-hero.jpg" 
                  alt="London OOH advertising landscape showing digital billboards and busy streets" 
                  className="rounded-xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Formats */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Featured Formats in London
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {formats.map((format, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-4">{format.icon}</div>
                    <CardTitle className="text-lg">{format.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">{format.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Guide */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Quick Media Pricing Guide
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Approximate pricing for 2-week campaigns
            </p>
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 border-b border-border font-semibold">Format</th>
                    <th className="text-left p-4 border-b border-border font-semibold">Price (Estimated)</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="p-4">{item.format}</td>
                      <td className="p-4 font-semibold text-primary">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Us for London OOH
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold mb-2">Local Expertise</h3>
                <p className="text-muted-foreground text-sm">Direct access to London's best media channels</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold mb-2">Fast Turnarounds</h3>
                <p className="text-muted-foreground text-sm">DOOH campaigns often live within 48–72 hours</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold mb-2">Data-Driven Planning</h3>
                <p className="text-muted-foreground text-sm">Borough-level targeting (e.g., Hackney, Soho, Camden)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-bold mb-2">Creative Support</h3>
                <p className="text-muted-foreground text-sm">Premium creative support for maximum memorability</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-hero text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Statement Across London?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Get started with same-day quotes and unbeatable rates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/quote">Get Same-Day Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                <Link to="/brief">Submit Your Brief</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default OOHAdvertisingLondon;
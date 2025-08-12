import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { updateMetaTags } from "@/utils/seo";

const PAGE_TITLE = "About Media Buying London | OOH Without the Dark Arts";
const META_DESCRIPTION =
  "Transparent OOH buying in London. We remove hidden margins and inflated rates with insider planning, clear rate cards, and same‑day quotes.";

const About: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}/about`;
    const seoData = {
      og_title: PAGE_TITLE,
      og_description: META_DESCRIPTION,
      twitter_title: PAGE_TITLE,
      twitter_description: META_DESCRIPTION,
      keywords: [
        "About Media Buying London",
        "London OOH",
        "OOH media buying",
        "billboard advertising London",
        "Tube advertising",
        "bus shelter ads"
      ],
      canonical_url: "/about",
    } as const;

    updateMetaTags(PAGE_TITLE, META_DESCRIPTION, url, seoData);

    // Add AboutPage structured data (in addition to base WebSite/LocalBusiness)
    const aboutStructuredData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Media Buying London",
      url,
      description: META_DESCRIPTION,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "About", item: url },
        ],
      },
    } as const;

    let aboutScript = document.getElementById("about-ld-json") as HTMLScriptElement | null;
    if (!aboutScript) {
      aboutScript = document.createElement("script");
      aboutScript.type = "application/ld+json";
      aboutScript.id = "about-ld-json";
      document.head.appendChild(aboutScript);
    }
    aboutScript.textContent = JSON.stringify(aboutStructuredData);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="relative max-w-5xl mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            About Media Buying London — Cutting Through the Dark Arts of OOH
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Media Buying London (MBL) exists to remove the guesswork, hidden margins, and inflated rates from the Out-of-Home (OOH) advertising industry.
            For too long, big media networks have used commitment deals, multi-buy packages, and rebate systems to baffle brands into overpaying. These
            “discounts” look attractive on paper, but behind the scenes, rates are marked up, formats are bundled for convenience (not effectiveness), and
            brands end up paying more for less.
          </p>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We’re here to change that.
          </p>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a specialist collective of London OOH planners and buyers with more than 450 years’ combined experience. We know how the market works —
            because we’ve been inside it. Today, we use that insider knowledge, transparent rate cards, and select-serving tech platforms to give brands direct
            access to the very best formats at the very best prices.
          </p>
        </div>
      </header>

      <main>
        {/* Divider */}
        <div className="px-4"><div aria-hidden className="max-w-5xl mx-auto text-center text-2xl select-none">⸻</div></div>

        {/* What We Do */}
        <section aria-labelledby="about-what-we-do" className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 id="about-what-we-do" className="text-3xl md:text-4xl font-bold tracking-tight">
              What We Do
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              From London billboards to Digital-48 roadside panels, from Tube escalator ads to borough-specific bus shelter takeovers, we buy it all — and we buy it smart.
            </p>
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
              <ul className="grid gap-4 md:grid-cols-2 text-sm md:text-base">
                <li className="leading-relaxed">
                  <span className="font-semibold">OOH Media Buying & Planning</span> — Negotiating insider rates for prime London advertising formats, without the hidden extras.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Campaign Management</span> — From booking to installation, every detail managed.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Creative Production Support</span> — Visuals optimised for each OOH format.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Multi-Channel OOH Strategies</span> — Tube, roadside, rail, bus, and digital integration for maximum reach.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="px-4"><div aria-hidden className="max-w-5xl mx-auto text-center text-2xl select-none">⸻</div></div>

        {/* The MBL Difference */}
        <section aria-labelledby="about-difference" className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 id="about-difference" className="text-3xl md:text-4xl font-bold tracking-tight">
              The MBL Difference
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              <span className="font-semibold">We are not an agency — and that matters.</span>
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 text-sm md:text-base">
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold">No Retainers</span> — You pay only for what you buy.</li>
                  <li><span className="font-semibold">No Fluff</span> — Every pound is invested in media that drives results.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold">Faster Turnaround</span> — Campaigns can be live in days, not weeks.</li>
                  <li><span className="font-semibold">Market-Beating Rates</span> — Buying power and transparency mean savings you won’t find elsewhere.</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              This is OOH media buying without the dark arts — no smoke, no mirrors, no locked-in commitments that benefit the seller more than the advertiser.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="px-4"><div aria-hidden className="max-w-5xl mx-auto text-center text-2xl select-none">⸻</div></div>

        {/* Who We Work With */}
        <section aria-labelledby="about-who" className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 id="about-who" className="text-3xl md:text-4xl font-bold tracking-tight">Who We Work With</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              We work with startups launching big ideas, retailers driving store traffic, event organisers filling venues, agencies needing specialist buying
              power, and national brands targeting London’s unique mix of residents, commuters, and tourists.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="px-4"><div aria-hidden className="max-w-5xl mx-auto text-center text-2xl select-none">⸻</div></div>

        {/* Why London OOH */}
        <section aria-labelledby="about-why" className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 id="about-why" className="text-3xl md:text-4xl font-bold tracking-tight">Why London OOH?</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              London is one of the most competitive, expensive, and high-value OOH markets in the world. The density of footfall, commuter patterns, and
              high-spend audiences makes it perfect for impact — but only if you know how to navigate it. We cut through the inflated rates and misleading
              “value adds” to make sure your campaign is placed where it will be seen, remembered, and acted on.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="px-4"><div aria-hidden className="max-w-5xl mx-auto text-center text-2xl select-none">⸻</div></div>

        {/* Get Started + CTA cluster */}
        <section aria-labelledby="about-get-started" className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h2 id="about-get-started" className="text-3xl md:text-4xl font-bold tracking-tight">Get Started</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you need a Shoreditch billboard, West End bus shelter, or a full Tube line domination, MBL makes OOH simple, fast, and cost-effective. Contact
              our team today for a same-day OOH quote and see why brands — and even agencies — trust us to get it done right.
            </p>

            {/* CTA Cluster (mirrors homepage hero) */}
            <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
              <Button
                size="lg"
                className="px-6"
                onClick={() => navigate("/quote")}
                aria-label="Start a quote – I know what I want"
              >
                I Know What I Want
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6"
                onClick={() => navigate("/configurator")}
                aria-label="Guide me – I need help choosing formats"
              >
                I Need Guidance
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="px-6"
                onClick={() => navigate("/outdoor-media")}
                aria-label="Explore outdoor media formats"
              >
                I'm Just Exploring
              </Button>
              <Button
                size="lg"
                variant="accent"
                className="px-6"
                onClick={() => navigate("/brief")}
                aria-label="Talk to an OOH specialist"
              >
                Talk to an OOH Specialist
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Same-day quotes. Transparent rates. London formats only.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;

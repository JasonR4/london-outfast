import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const budget = params.get('budget');

  useEffect(() => { document.title = 'Thank you | Media Buying London' }, []);

  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">We’ll call you shortly</h1>
          <p className="text-muted-foreground mt-3">Thanks for your brief{budget ? ` (budget: ${budget})` : ''}. A specialist will be in touch very soon.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button asChild variant="outline"><a href="tel:+442045243019">Call us now</a></Button>
            <Button asChild><Link to="/">Back to Home</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}

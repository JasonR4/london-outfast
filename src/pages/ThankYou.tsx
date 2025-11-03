import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { updateMetaTags } from "@/utils/seo";
export default function ThankYou() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const budget = params.get("budget") || "";
  const firstname = params.get("firstname") || "";
  const objective = params.get("objective") || "";
  const targetAreas = (params.get("target_areas") || "").split(",").filter(Boolean);
  const formats = (params.get("formats") || "").split(",").filter(Boolean);
  const startMonth = params.get("start_month") || "";
  const endMonth = params.get("end_month") || "";
  const creativeStatus = params.get("creative_status") || "";
  const notes = params.get("notes") || "";
  const market = params.get("market") || "";
  const audience = params.get("audience") || "";
  const formatPreference = params.get("format_preference") || "";

  useEffect(() => {
    const title = `Thanks, ${firstname || "there"} — Brief received | Media Buying London`;
    const desc = `OOH brief received: Budget ${budget || "N/A"}, Objective ${objective || "N/A"}. A specialist will call you shortly.`;
    updateMetaTags(title, desc);
  }, [firstname, budget, objective]);

  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight text-center">Thanks, {firstname || "there"}. We’ve got your brief.</h1>
          <p className="text-muted-foreground mt-3 text-center">Here’s what you told us — a specialist will call you shortly.</p>

          <div className="mt-8 border border-border rounded-lg p-6 bg-background">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Market</dt>
                <dd className="font-medium">{market || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Budget</dt>
                <dd className="font-medium">£{budget || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Primary objective</dt>
                <dd className="font-medium">{objective || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Format preference</dt>
                <dd className="font-medium">{formatPreference || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Environments</dt>
                <dd className="font-medium">{formats.length ? formats.join(", ") : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Start date</dt>
                <dd className="font-medium">{startMonth || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">End date</dt>
                <dd className="font-medium">{endMonth || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Target audience</dt>
                <dd className="font-medium">{audience || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Creative status</dt>
                <dd className="font-medium">{creativeStatus || "—"}</dd>
              </div>
              {notes ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Additional notes</dt>
                  <dd className="font-medium whitespace-pre-wrap">{notes}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <Button asChild variant="outline"><a href="tel:+442045243019">Call us now</a></Button>
            <Button asChild><Link to="/">Back to Home</Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}

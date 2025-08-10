import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
}

interface SubmitPayload {
  quoteSessionId?: string | null;
  contact: SubmitContact;
  source: "smart-quote" | "outdoor-media" | "configurator";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as SubmitPayload;

    // Minimal placeholder implementation:
    // - In a full version, you'd: lock the draft, compute versions, sync HubSpot, generate PDF, etc.
    // For now, just echo back a success response to unblock the client flow.
    const response = {
      status: "ok",
      received: {
        quoteSessionId: payload.quoteSessionId || null,
        source: payload.source,
        contactEmail: payload.contact?.email || null,
      },
      message: "submit-quote processed",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("submit-quote error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

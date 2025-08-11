import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { sendEmail } from "@/utils/email";

const EmailTest = () => {
  const { toast } = useToast();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test email from Media Buying London");
  const [html, setHtml] = useState("<h1>Test</h1><p>This is a live test email.</p>");
  const [replyTo, setReplyTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Email Test - Media Buying London";
  }, []);

  const handleSend = async () => {
    const recipients = to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      toast({ title: "Add at least one recipient", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await sendEmail({
        to: recipients,
        subject,
        html,
        reply_to: replyTo || undefined,
        brand_name: "Media Buying London",
        brand_from: "Media Buying London <quotes@mediabuyinglondon.co.uk>",
      });

      toast({ title: "Email sent", description: "Check the recipients' inboxes." });
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message || "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <article className="max-w-3xl mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Uses the verified domain and Resend. Default From: Media Buying London &lt;quotes@mediabuyinglondon.co.uk&gt;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="to">To (comma separated)</Label>
              <Input id="to" placeholder="you@example.com, colleague@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replyTo">Reply-To (optional)</Label>
              <Input id="replyTo" placeholder="submitter@company.com" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="html">HTML</Label>
              <Textarea id="html" className="min-h-[200px]" value={html} onChange={(e) => setHtml(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={loading}>
                {loading ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </article>
    </main>
  );
};

export default EmailTest;

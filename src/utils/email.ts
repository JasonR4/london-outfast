import { supabase } from "@/integrations/supabase/client";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
  brand_name?: string;
  brand_from?: string;
};

export async function sendEmail(params: SendEmailParams) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: params,
  });
  if (error) throw error;
  return data;
}

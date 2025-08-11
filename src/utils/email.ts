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
  const payload: SendEmailParams = {
    brand_name: params.brand_name ?? 'Media Buying London',
    brand_from: params.brand_from ?? 'Media Buying London <quotes@mediabuyinglondon.co.uk>',
    ...params,
  };
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: payload,
  });
  if (error) throw error;
  return data;
}

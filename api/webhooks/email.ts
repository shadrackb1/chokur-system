import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  console.log('[Email Webhook] Received:', JSON.stringify(req.body, null, 2));

  try {
    // Handle Resend/SendGrid webhook events
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const { type, data } = event;

      if (type === 'email.delivered' || type === 'delivered') {
        await supabase
          .from('audit_logs')
          .insert({
            action: 'email_delivered',
            entity_type: 'email',
            new_values: { messageId: data.message_id, email: data.to, subject: data.subject },
            created_at: new Date().toISOString(),
          });
      } else if (type === 'email.bounced' || type === 'bounced') {
        await supabase
          .from('audit_logs')
          .insert({
            action: 'email_bounced',
            entity_type: 'email',
            new_values: { messageId: data.message_id, email: data.to, reason: data.reason },
            created_at: new Date().toISOString(),
          });
      } else if (type === 'email.complained' || type === 'spam_report') {
        await supabase
          .from('audit_logs')
          .insert({
            action: 'email_complained',
            entity_type: 'email',
            new_values: { messageId: data.message_id, email: data.to },
            created_at: new Date().toISOString(),
          });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Email Webhook] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
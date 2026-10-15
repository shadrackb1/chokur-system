import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  console.log('[SMS Webhook] Received:', JSON.stringify(req.body, null, 2));

  try {
    // Handle Africa's Talking delivery reports
    const { data } = req.body;

    if (data) {
      for (const report of data) {
        const { messageId, status, number, cost, networkCode } = report;

        // Update WhatsApp message status
        await supabase
          .from('whatsapp_messages')
          .update({
            status: status === 'Success' ? 'delivered' : 'failed',
            metadata: { ...report, sms_cost: cost, network_code: networkCode },
            delivered_at: status === 'Success' ? new Date().toISOString() : null,
          })
          .eq('metadata->>messageId', messageId);

        // Log audit
        await supabase.from('audit_logs').insert({
          action: 'sms_delivery_report',
          entity_type: 'whatsapp_message',
          new_values: report,
          created_at: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[SMS Webhook] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
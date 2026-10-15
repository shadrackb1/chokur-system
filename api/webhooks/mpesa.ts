import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  console.log('[M-Pesa Webhook] Received:', JSON.stringify(req.body, null, 2));

  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
    }

    const callback = Body.stkCallback;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    const checkoutRequestId = callback.CheckoutRequestID;
    const callbackMetadata = callback.CallbackMetadata?.Item || [];

    // Extract payment details
    let mpesaCode = '';
    let amount = 0;
    let phoneNumber = '';

    for (const item of callbackMetadata) {
      if (item.Name === 'MpesaReceiptNumber') mpesaCode = item.Value;
      if (item.Name === 'Amount') amount = item.Value;
      if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
    }

    // Find the payment record by mpesa_code (stored during STK push)
    const { data: payment, error: findError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('mpesa_code', checkoutRequestId)
      .single();

    if (findError || !payment) {
      console.warn('[M-Pesa] Payment record not found for:', checkoutRequestId);
      // Try to find by phone number and amount as fallback
      const { data: payments } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('amount_paid', amount)
        .eq('payment_method', 'mpesa')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (payments && payments.length > 0) {
        const pendingPayment = payments[0];
        await supabase
          .from('fee_payments')
          .update({
            mpesa_code: mpesaCode,
            status: resultCode === 0 ? 'completed' : 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', pendingPayment.id);
      }
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (resultCode === 0) {
      // Payment successful
      await supabase
        .from('fee_payments')
        .update({
          mpesa_code: mpesaCode,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Send notification to parent/student
      const { data: student } = await supabase
        .from('students')
        .select('parent_phone, parent_email, name, adm_no')
        .eq('id', payment.student_id)
        .single();

      if (student) {
        // Log notification (integrate with SMS/WhatsApp service here)
        console.log('[M-Pesa] Payment confirmed for student:', student.name, 'Amount:', amount);
      }
    } else {
      // Payment failed
      await supabase
        .from('fee_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      console.warn('[M-Pesa] Payment failed:', resultDesc);
    }

    // Log webhook for audit
    await supabase.from('audit_logs').insert({
      school_id: payment.school_id,
      user_id: payment.received_by,
      action: 'mpesa_callback',
      entity_type: 'fee_payment',
      entity_id: payment.id,
      new_values: { resultCode, resultDesc, mpesaCode, amount },
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error: any) {
    console.error('[M-Pesa Webhook] Error:', error);
    return res.status(500).json({ ResultCode: 1, ResultDesc: error.message });
  }
}
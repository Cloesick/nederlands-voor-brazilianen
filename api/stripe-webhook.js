/* POST /api/stripe-webhook (called by Stripe, not the browser)
   On checkout.session.completed, marks the device premium in Supabase.
   Requires env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY.
   Configure this URL in the Stripe Dashboard -> Developers -> Webhooks:
     https://<your-domain>/api/stripe-webhook  (event: checkout.session.completed) */
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports.config = { api: { bodyParser: false } }; // Stripe needs the raw body to verify the signature

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: 'not_configured' }); return;
  }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Never acknowledge a paid session we did not actually record. A 2xx tells Stripe the
  // entitlement is stored and it will never redeliver the event, so every failure below has to
  // surface as a non-2xx: that both triggers Stripe's retries and makes the endpoint show up as
  // failing in the dashboard. Silently returning "received" here loses the customer's purchase
  // with no trace anywhere.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const deviceId = session.client_reference_id || (session.metadata && session.metadata.deviceId);
    if (!deviceId) {
      console.error('[stripe-webhook] paid session has no deviceId, cannot grant premium:', session.id);
      res.status(500).json({ error: 'missing_device_id', session: session.id });
      return;
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('[stripe-webhook] SUPABASE_URL/SUPABASE_SERVICE_KEY unset, cannot record:', session.id);
      res.status(503).json({ error: 'entitlement_store_not_configured', session: session.id });
      return;
    }
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      // supabase-js reports query failures in `error` rather than throwing; only transport-level
      // failures (DNS, timeouts) reject. Both have to be treated as "not recorded".
      const { error } = await supabase.from('entitlements').upsert({
        device_id: deviceId,
        premium: true,
        stripe_customer_id: session.customer || null,
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('[stripe-webhook] entitlement write failed for', session.id, '-', err.message);
      res.status(503).json({ error: 'entitlement_write_failed', session: session.id });
      return;
    }
  }
  res.status(200).json({ received: true });
};

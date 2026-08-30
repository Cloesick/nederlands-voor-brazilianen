/* GET /api/premium-status?device=<deviceId> -> { premium, configured }
   Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY. Returns configured:false gracefully
   (never an error) so the free app works normally before monetization is set up. */
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const deviceId = (req.query && req.query.device) || '';
  if (!deviceId) { res.status(400).json({ error: 'device required' }); return; }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    res.status(200).json({ premium: false, configured: false });
    return;
  }
  // A failed lookup is NOT the same answer as "not premium". Returning premium:false on error
  // made the client cache that false and revoke Premium from someone who paid, for the duration
  // of any Supabase hiccup. Fail with a 503 instead so the client keeps its last known state.
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('entitlements').select('premium').eq('device_id', deviceId).maybeSingle();
    if (error) throw new Error(error.message);
    res.status(200).json({ premium: !!(data && data.premium), configured: true });
  } catch (err) {
    console.error('[premium-status] entitlement lookup failed for', deviceId, '-', err.message);
    res.status(503).json({ error: 'entitlement_lookup_failed' });
  }
};

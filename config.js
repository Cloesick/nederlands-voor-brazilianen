/* Public, safe-to-commit config. No secrets here (this file ships to every browser).
   Fill these in once you have real accounts — see MONETIZATION.md for exact steps. */
window.NL_CONFIG = {
  // Google AdSense. Client ID reused from the existing approved account (also used on Onbudsman) -
  // still requires: (1) adding this site as a property in the AdSense dashboard and waiting for
  // per-site approval, (2) creating an ad unit for it and pasting its Slot ID below. Ads stay off
  // (adSlotHTML renders nothing) until both ADSENSE_CLIENT and ADSENSE_SLOT are set.
  ADSENSE_CLIENT: "ca-pub-3766515514893974",
  ADSENSE_SLOT: null, // paste the ad unit's data-ad-slot value here once created in AdSense
  ADSENSE_NONPERSONALIZED: true, // no consent banner needed; lower CPM than personalized ads
  // Set to true once Stripe checkout is wired (see /api/checkout.js + MONETIZATION.md)
  PREMIUM_ENABLED: false,
};

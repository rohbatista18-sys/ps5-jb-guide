export const TRACKER_URL = "https://ps5-jb-tracker.vercel.app";
export const COMMUNITY_URL = "https://www.reddit.com/r/PS5_Jailbreak/";
export const REPO_URL = "https://github.com/rohbatista18-sys/ps5-jb-guide";

export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3100";

// Same PayPal link as the tracker's "Support the site with US$ 1" button.
export const SUPPORT_URL = "https://www.paypal.com/ncp/payment/6R8Q5LX8RY2CQ";

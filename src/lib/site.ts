export const TRACKER_URL = "https://ps5-jb-tracker.vercel.app";
export const COMMUNITY_URL = "https://www.reddit.com/r/PS5_Jailbreak/";
export const REPO_URL = "https://github.com/rohbatista18-sys/ps5-jb-guide";

export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3100";

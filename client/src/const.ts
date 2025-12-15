export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate login URL at runtime.
 * In standalone mode (without Manus OAuth), redirects to local login page.
 */
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Standalone mode: redirect to local login page
  if (!oauthPortalUrl || !appId) {
    return "/login";
  }
  
  // OAuth mode: generate Manus OAuth URL
  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (error) {
    console.warn("OAuth URL construction failed, falling back to local login:", error);
    return "/login";
  }
};

import { useEffect } from "react";

/**
 * Persists the OAuth nonce in a cookie for server-side state verification.
 */
export function useStateCookie() {
  useEffect(() => {
    try {
      const nonce = sessionStorage.getItem("oauth_nonce");
      if (nonce) {
        document.cookie = `oauth_nonce=${nonce}; path=/; SameSite=Lax`;
      }
    } catch {
      // ignore
    }
  }, []);
}

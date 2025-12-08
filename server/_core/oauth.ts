import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { parse as parseCookie } from "cookie";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function decodeState(state: string): { redirectUri: string; codeVerifier?: string; nonce?: string } {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") {
      return {
        redirectUri: parsed.redirectUri,
        codeVerifier: typeof parsed.codeVerifier === "string" ? parsed.codeVerifier : undefined,
        nonce: typeof parsed.nonce === "string" ? parsed.nonce : undefined,
      };
    }
  } catch {
    // ignore
  }
  return { redirectUri: Buffer.from(state, "base64").toString("utf8") };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const decodedState = decodeState(state);
      // Verify state via cookie/nonce (parsed manually to avoid missing cookie-parser)
      const cookies = parseCookie(req.headers.cookie || "");
      const stateCookie = cookies["oauth_nonce"] || cookies["oauth_state"];
      if (decodedState.nonce && stateCookie && stateCookie !== decodedState.nonce) {
        res.status(400).json({ error: "Invalid state" });
        return;
      }

      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Audit login
      try {
        const { logAudit } = await import("../services/audit");
        await logAudit({
          action: "auth.oauthLogin",
          actor: { id: userInfo.openId, role: userInfo.loginMethod ?? "user" },
          tenantId: process.env.TENANT_ID ?? "default",
          meta: { provider: userInfo.loginMethod ?? userInfo.platform ?? "oauth" },
        });
      } catch (err) {
        // ignore audit failures
      }

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

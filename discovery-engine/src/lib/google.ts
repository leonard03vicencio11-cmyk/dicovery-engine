import { google } from "googleapis";

/**
 * Shared Google auth client. Expects a service account JSON (the full key
 * file contents, minified to one line) in GOOGLE_SERVICE_ACCOUNT_JSON.
 *
 * The service account must be:
 *  - Shared as an Editor on the target Google Sheet
 *  - Given access to (or made the owner of) the target Drive folder
 * so it can create Docs and write rows without a live user OAuth session.
 */
export function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

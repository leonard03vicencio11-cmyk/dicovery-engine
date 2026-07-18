# Discovery Engine — DOSSIER_OPEN // 2026 // FILE_11

A branching, Typeform-style client intake that only asks what applies, hands
back an AI-generated strategy summary on the spot, saves the full report as
a Google Doc, gets a Calendly call booked, and — if the lead doesn't book —
nudges them once a week (capped at 4 tries, stops itself if they book or
unsubscribe).

Built natively (not as a Typeform embed) so the whole chain — form →
AI summary → Doc → Sheet → email → reminders — runs through one codebase
you control.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Framer Motion for step transitions
- Anthropic API (Claude) for the strategy summary
- Google Drive + Sheets API (service account) for the report doc + lead tracker
- Gmail SMTP (App Password) for sending
- Calendly (inline embed + webhook)
- Vercel Cron for the weekly reminder job

## Project structure

```
src/
  app/
    page.tsx                    Landing page
    discovery/page.tsx           The multi-step branching form
    discovery/results/page.tsx   AI summary + Calendly embed
    api/submit/route.ts          Main submission handler
    api/calendly-webhook/route.ts  Marks a lead BOOKED
    api/weekly-reminder/route.ts   Cron: sends nudge emails
    api/unsubscribe/route.ts       Stops reminders for one lead
  components/
    fields/Field.tsx             Form field primitives
    CornerFrame.tsx               Decorative corner-bracket wrapper
  lib/
    types.ts                     Shared TypeScript types
    flow.ts                      Branching step-order logic
    anthropic.ts                 Claude API call
    google.ts / drive.ts / sheets.ts   Google integrations
    gmail.ts                     Email sending
vercel.json                      Cron schedule
.env.example                     All required environment variables
```

## One design note

The original spec called for "one question per screen." Business Snapshot
(name/website/industry/location/email/name) is grouped into a single screen
instead — it's routine contact info, not a decision point, and bundling it
cuts the flow from ~20 screens to ~12–15 without losing the "only ask what's
relevant" branching that actually matters (goal path, maturity, channels,
paid ads, website, email, budget all still branch exactly as specified).

## Setup

### 1. Anthropic

Get an API key at console.anthropic.com → `ANTHROPIC_API_KEY`.

### 2. Google Cloud (Drive + Sheets)

1. Create a project at console.cloud.google.com, enable the **Google Drive
   API** and **Google Sheets API**.
2. Create a **Service Account**, generate a JSON key.
3. Minify the JSON to one line and set it as `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Create a Google Sheet for lead tracking. In row 1, add these headers:
   `email | name | business | goal_path | status | reminder_count | last_reminder_date | doc_link | submitted_at | unsubscribed`
   Name the tab `Leads`. Share the sheet with the service account's
   `client_email` as **Editor**. Set `GOOGLE_SHEET_ID` to the sheet ID from
   its URL.
5. Create (or pick) a Drive folder for generated reports, share it with the
   same service account as **Editor**, set `GOOGLE_DRIVE_FOLDER_ID`.

### 3. Gmail sending

1. Turn on 2-Step Verification on the sending Gmail account.
2. Generate an App Password at myaccount.google.com/apppasswords.
3. Set `GMAIL_SENDER_ADDRESS` and `GMAIL_APP_PASSWORD`.

Heads-up: Gmail SMTP has practical daily sending limits (~500/day on a
regular account). Fine at freelancer scale — swap `src/lib/gmail.ts` for
Resend or Postmark later if volume grows.

### 4. Calendly

1. Set `NEXT_PUBLIC_CALENDLY_URL` to your scheduling page link.
2. In Calendly → Integrations → Webhooks, add a subscription for
   `invitee.created` pointing to `https://yourdomain.com/api/calendly-webhook`.
   Copy the signing secret into `CALENDLY_WEBHOOK_SIGNING_KEY`.

### 5. Cron protection

Set `CRON_SECRET` to any random string. In Vercel's dashboard, Vercel Cron
calls your route directly — if you want the extra check in
`weekly-reminder/route.ts` to actually verify a header, add
`Authorization: Bearer <CRON_SECRET>` under Project Settings → Cron Jobs,
or remove that check if you'd rather rely on the route being unguessable.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Visit `http://localhost:3000`. Any integration left unconfigured
degrades gracefully (e.g. no Google key → no Doc link, but the AI summary
and form still work).

## Deploy

```bash
vercel deploy
```

Add all `.env.example` vars in the Vercel dashboard under Project Settings →
Environment Variables before your first deploy. The cron job in
`vercel.json` activates automatically once deployed.

## Testing the full flow before going live

1. Fill out `/discovery` end to end.
2. Confirm the results page shows an AI summary and (if Google is
   configured) a working Doc link.
3. Check your Leads sheet for a new `NOT_BOOKED` row.
4. Book the Calendly slot from the results page → confirm the webhook
   flips that row to `BOOKED`.
5. Manually hit `/api/weekly-reminder` (with your `CRON_SECRET` bearer
   token) on a lead you've backdated `last_reminder_date` on, to confirm
   reminder emails send and `reminder_count` increments.

import { google, sheets_v4 } from "googleapis";
import { getGoogleAuth } from "./google";

const SHEET_NAME = "Leads";
const HEADER = [
  "email",
  "name",
  "business",
  "goal_path",
  "status",
  "reminder_count",
  "last_reminder_date",
  "doc_link",
  "submitted_at",
  "unsubscribed",
] as const;

export interface LeadRow {
  email: string;
  name: string;
  business: string;
  goal_path: string;
  status: "NOT_BOOKED" | "BOOKED" | "AI_SUMMARY_FAILED";
  reminder_count: number;
  last_reminder_date: string;
  doc_link: string;
  submitted_at: string;
  unsubscribed: boolean;
}

function getSheetsClient() {
  const auth = getGoogleAuth();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

function rowToLead(row: string[]): LeadRow {
  return {
    email: row[0] || "",
    name: row[1] || "",
    business: row[2] || "",
    goal_path: row[3] || "",
    status: (row[4] as LeadRow["status"]) || "NOT_BOOKED",
    reminder_count: Number(row[5] || 0),
    last_reminder_date: row[6] || "",
    doc_link: row[7] || "",
    submitted_at: row[8] || "",
    unsubscribed: row[9] === "true",
  };
}

function leadToRow(lead: LeadRow): string[] {
  return [
    lead.email,
    lead.name,
    lead.business,
    lead.goal_path,
    lead.status,
    String(lead.reminder_count),
    lead.last_reminder_date,
    lead.doc_link,
    lead.submitted_at,
    String(lead.unsubscribed),
  ];
}

async function getAllRows(sheets: sheets_v4.Sheets, spreadsheetId: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A2:J`,
  });
  return res.data.values || [];
}

/** Insert a new lead, or update the existing row if the email already exists. */
export async function upsertLead(lead: LeadRow): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return;

  const rows = await getAllRows(sheets, spreadsheetId);
  const existingIndex = rows.findIndex((r) => r[0] === lead.email);

  if (existingIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: "RAW",
      requestBody: { values: [leadToRow(lead)] },
    });
  } else {
    const rowNumber = existingIndex + 2; // +1 header, +1 to move from 0-index
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [leadToRow(lead)] },
    });
  }
}

export async function setLeadStatusByEmail(
  email: string,
  status: LeadRow["status"]
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return;

  const rows = await getAllRows(sheets, spreadsheetId);
  const index = rows.findIndex((r) => r[0] === email);
  if (index === -1) return;

  const lead = rowToLead(rows[index]);
  lead.status = status;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${index + 2}:J${index + 2}`,
    valueInputOption: "RAW",
    requestBody: { values: [leadToRow(lead)] },
  });
}

export async function markUnsubscribed(email: string): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return;

  const rows = await getAllRows(sheets, spreadsheetId);
  const index = rows.findIndex((r) => r[0] === email);
  if (index === -1) return;

  const lead = rowToLead(rows[index]);
  lead.unsubscribed = true;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${index + 2}:J${index + 2}`,
    valueInputOption: "RAW",
    requestBody: { values: [leadToRow(lead)] },
  });
}

const MAX_REMINDERS = 4;
const REMINDER_INTERVAL_DAYS = 7;

/** Leads eligible for this week's reminder: not booked, under the cap,
 * not unsubscribed, and at least REMINDER_INTERVAL_DAYS since the last send. */
export async function getRemindableLeads(): Promise<
  { rowNumber: number; lead: LeadRow }[]
> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return [];

  const rows = await getAllRows(sheets, spreadsheetId);
  const now = Date.now();

  return rows
    .map((row, i) => ({ rowNumber: i + 2, lead: rowToLead(row) }))
    .filter(({ lead }) => {
      if (lead.status !== "NOT_BOOKED") return false;
      if (lead.unsubscribed) return false;
      if (lead.reminder_count >= MAX_REMINDERS) return false;
      if (!lead.last_reminder_date) return true;
      const last = new Date(lead.last_reminder_date).getTime();
      const daysSince = (now - last) / (1000 * 60 * 60 * 24);
      return daysSince >= REMINDER_INTERVAL_DAYS;
    });
}

export async function recordReminderSent(rowNumber: number, lead: LeadRow) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !spreadsheetId) return;

  const updated: LeadRow = {
    ...lead,
    reminder_count: lead.reminder_count + 1,
    last_reminder_date: new Date().toISOString().slice(0, 10),
  };
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [leadToRow(updated)] },
  });
}

export function isSheetsConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_SHEET_ID);
}

export { HEADER as SHEET_HEADER };

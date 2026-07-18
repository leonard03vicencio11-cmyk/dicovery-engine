import { NextRequest, NextResponse } from "next/server";
import { markUnsubscribed } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return new NextResponse("Missing email or token.", { status: 400 });
  }

  const expectedToken = Buffer.from(email).toString("base64url");
  if (token !== expectedToken) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  }

  await markUnsubscribed(email);

  return new NextResponse(
    `<!doctype html><html><body style="font-family: monospace; background:#0a0a0a; color:#ededed; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
      <p>You've been unsubscribed from reminder emails. Your strategy document stays available.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

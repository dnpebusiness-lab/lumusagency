import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  service?: unknown;
  message?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const service = asString(body.service);
  const message = asString(body.message);

  if (!name || !email || !service || !message) {
    return NextResponse.json(
      { ok: false, error: "Please complete every field before sending." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn’t look right." },
      { status: 400 },
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Message is too long." },
      { status: 400 },
    );
  }

  console.log("[lumus:contact]", {
    receivedAt: new Date().toISOString(),
    name,
    email,
    service,
    messagePreview: message.slice(0, 120),
    messageLength: message.length,
  });

  return NextResponse.json({ ok: true });
}

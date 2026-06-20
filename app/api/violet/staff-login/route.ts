import { NextResponse } from "next/server";

type StaffLoginRequest = {
  email?: string;
  password?: string;
};

const staffAccounts = {
  "contact@violetproject.co.uk": {
    name: "Admin",
    role: "admin",
    password: process.env.ADMIN_TEMP_PASSWORD,
  },
  "info@violetproject.co.uk": {
    name: "Melanie Griffin",
    role: "manager",
    password: process.env.MELANIE_TEMP_PASSWORD,
  },
} as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as StaffLoginRequest;
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Enter your staff email and password." }, { status: 400 });
  }

  const account = staffAccounts[email as keyof typeof staffAccounts];
  if (!account || !account.password || password !== account.password) {
    return NextResponse.json({ ok: false, error: "Staff email or password is not recognised." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    email,
    name: account.name,
    role: account.role,
  });
}

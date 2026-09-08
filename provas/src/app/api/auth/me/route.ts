import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureAuthTables } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await ensureAuthTables();

  const token = req.nextUrl.searchParams.get("token") || "";
  if (!token) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  const { rows } = await sql`
    select u.first_name, u.last_name, u.email, u.phone
    from sessions s
    join users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const u = rows[0];
  return NextResponse.json({
    name: `${u.first_name} ${u.last_name}`,
    email: u.email,
    phone: u.phone,
  });
}

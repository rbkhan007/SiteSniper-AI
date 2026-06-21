import { NextResponse } from "next/server";
import { getSession, getFullProfile } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const profile = await getFullProfile(session.id);
    return NextResponse.json({ user: profile || session });
  } catch {
    return NextResponse.json({ user: null });
  }
}

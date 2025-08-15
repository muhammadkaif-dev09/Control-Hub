// /app/api/check-doc-limit/route.js
import { supabase } from "@/supabase/createClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;

    if (count >= 2) {
      return NextResponse.json({
        allowed: false,
        message: "Max limit reached",
      });
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

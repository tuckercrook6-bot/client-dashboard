import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { client_id, category, priority, description } = body;

    if (!category || !description) {
      return NextResponse.json(
        { error: "category and description are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("change_requests").insert({
      client_id: client_id || null,
      user_id: user.id,
      category: String(category),
      priority: String(priority || "normal"),
      description: String(description),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

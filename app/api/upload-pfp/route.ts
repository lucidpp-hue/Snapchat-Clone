import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const blob = await put(`pfp/${user.id}-${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // Update profile in DB
    await supabase.from("profiles").update({ avatar_url: blob.url }).eq("id", user.id);

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("PFP upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

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

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("messages")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error("[v0] Message image storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("messages").getPublicUrl(path);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[v0] Post image upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

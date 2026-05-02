import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in get-users route handler", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

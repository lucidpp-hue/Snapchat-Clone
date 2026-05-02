import { createClient } from "@/lib/supabase/server";
import { connectToMongoDB } from "@/lib/db";
import User, { IUserDocument } from "@/models/userModel";
import { NextResponse } from "next/server";

export const GET = async () => {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		await connectToMongoDB();

		const users: IUserDocument[] = await User.find({ supabaseId: { $ne: user.id } });
		return NextResponse.json(users);
	} catch (error) {
		console.log("Error in get-users route handler", error);
		throw error;
	}
};

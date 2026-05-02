import ChatSideBar from "@/components/chat/chat-sidebar";
import { createClient } from "@/lib/supabase/server";
import { connectToMongoDB } from "@/lib/db";
import User from "@/models/userModel";

const Layout = async ({ children }: React.PropsWithChildren) => {
	// Upsert the Supabase user into MongoDB so the rest of the app can reference them
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (user) {
		await connectToMongoDB();
		await User.findOneAndUpdate(
			{ supabaseId: user.id },
			{
				supabaseId: user.id,
				email: user.email ?? "",
				fullName: user.user_metadata?.full_name ?? user.email ?? "User",
				avatar: user.user_metadata?.avatar_url ?? "",
			},
			{ upsert: true, new: true }
		);
	}

	return (
		<main className='flex h-screen'>
			<ChatSideBar />
			{children}
		</main>
	);
};
export default Layout;

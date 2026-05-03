import ChatSideBar from "@/components/chat/chat-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/data";

const Layout = async ({ children }: React.PropsWithChildren) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "";

  let avatarUrl = "";
  if (user) {
    try {
      const profile = await getUserProfile(user.id);
      avatarUrl = profile.avatar_url || "";
    } catch {
      // profile not yet created — ignore
    }
  }

  return (
    <main className="flex h-screen">
      <ChatSideBar fullName={fullName} avatarUrl={avatarUrl} userId={user?.id} />
      {children}
    </main>
  );
};
export default Layout;

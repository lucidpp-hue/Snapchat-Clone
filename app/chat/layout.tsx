import ChatSideBar from "@/components/chat/chat-sidebar";
import { createClient } from "@/lib/supabase/server";

const Layout = async ({ children }: React.PropsWithChildren) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "";

  return (
    <main className="flex h-screen">
      <ChatSideBar fullName={fullName} />
      {children}
    </main>
  );
};
export default Layout;

import { createClient } from "@/lib/supabase/server";
import ChatMessages from "@/components/chat/chat-messages";
import ChatTopbar from "@/components/chat/chat-topbar";
import SendMsgInput from "@/components/chat/send-msg-input";
import { getMessages } from "@/lib/data";

const ChatHistoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const messages = user ? await getMessages(user.id, id) : [];

  return (
    <div className="bg-sigMain h-screen flex-[3_3_0%] flex flex-col px-4 text-white">
      <ChatTopbar params={{ id }} />
      <div className="bg-sigSurface flex-1 overflow-y-auto rounded-xl my-4 border border-sigColorBgBorder py-2 px-3">
        <div className="flex flex-col">
          <ChatMessages messages={messages} authUserId={user?.id ?? ""} />
        </div>
      </div>
      <SendMsgInput />
    </div>
  );
};

export default ChatHistoryPage;

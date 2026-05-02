import { createClient } from "@/lib/supabase/server";
import ChatMessages from "@/components/chat/chat-messages";
import ChatTopbar from "@/components/chat/chat-topbar";
import SendMsgInput from "@/components/chat/send-msg-input";
import { getMessages } from "@/lib/data";

const ChatHistoryPage = async ({ params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const messages = user ? await getMessages(user.id, params.id) : [];
    const sessionLike = user ? { user: { _id: user.id } } : null;

    return (
        <div className='bg-sigMain h-screen flex-[3_3_0%] flex flex-col px-4 text-white'>
            {/* topbar */}
            <ChatTopbar params={params} />
            {/* below-topbar section */}
            <div className='bg-sigSurface flex-1 overflow-y-auto rounded-xl my-4 border border-sigColorBgBorder  py-2 px-3 '>
                {/* Message container */}
                <div className='flex flex-col'>
                    <ChatMessages messages={messages} session={sessionLike as any} />
                </div>
            </div>
            {/* Input */}
            <SendMsgInput />
        </div>
    );
}

export default ChatHistoryPage

import { Suspense } from "react";
import { ChatsSkeleton } from "../skeletons/chat-skeletons";
import ChatSideBarClient from "./chat-sidebar-client";
import Chats from "./chats";

type ChatSideBarProps = {
  fullName: string;
  avatarUrl?: string;
  userId?: string;
};

const ChatSideBar = ({ fullName, avatarUrl, userId }: ChatSideBarProps) => {
  return (
    <ChatSideBarClient fullName={fullName} avatarUrl={avatarUrl} userId={userId}>
      <Suspense fallback={<ChatsSkeleton />}>
        <Chats />
      </Suspense>
    </ChatSideBarClient>
  );
};

export default ChatSideBar;

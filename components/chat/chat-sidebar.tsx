import { Suspense } from "react";
import { ChatsSkeleton } from "../skeletons/chat-skeletons";
import ChatSideBarClient from "./chat-sidebar-client";
import Chats from "./chats";

type ChatSideBarProps = {
  fullName: string;
};

const ChatSideBar = ({ fullName }: ChatSideBarProps) => {
  return (
    <ChatSideBarClient fullName={fullName}>
      <Suspense fallback={<ChatsSkeleton />}>
        <Chats />
      </Suspense>
    </ChatSideBarClient>
  );
};

export default ChatSideBar;

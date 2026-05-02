"use client";
import { SearchIcon } from "lucide-react";
import LogoutButton from "../shared/logout-button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import Image from "next/image";
import { useState } from "react";
import NewChatDialog from "./new-chat-dialog";

type ChatSideBarClientProps = {
  fullName: string;
  children: React.ReactNode;
};

const ChatSideBarClient = ({ fullName, children }: ChatSideBarClientProps) => {
  const [newChatOpen, setNewChatOpen] = useState(false);

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <aside className="flex-[1_1_0%] flex flex-col bg-black text-white">
        <div className="sticky top-0 bg-black z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="relative">
              <Avatar className="cursor-pointer hover:bg-sigBackgroundSecondaryHover">
                <AvatarFallback className="bg-orange-400 text-black font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              className="bg-sigButton hover:bg-sigButtonHover text-white rounded-full h-8 w-8 relative p-2"
              onClick={() => setNewChatOpen(true)}
              title="New Chat"
            >
              <Image src={"/chat.svg"} fill alt="New chat" />
            </Button>
            <LogoutButton />
          </div>
          <div className="p-4">
            <div className="text-gray-400 p-1 flex gap-2 rounded-full bg-sigSurface border border-sigColorBgBorder">
              <SearchIcon className="text-gray-400 w-5" />
              <input
                className="bg-transparent border-none text-white placeholder-gray-400 focus:outline-none"
                placeholder="Поиск"
                type="text"
              />
            </div>
          </div>
        </div>

        {children}
      </aside>

      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </>
  );
};

export default ChatSideBarClient;

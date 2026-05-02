"use client";
import { SearchIcon } from "lucide-react";
import LogoutButton from "../shared/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NewChatDialog from "./new-chat-dialog";

type ChatSideBarClientProps = {
  fullName: string;
  avatarUrl?: string;
  userId?: string;
  children: React.ReactNode;
};

const ChatSideBarClient = ({ fullName, avatarUrl, userId, children }: ChatSideBarClientProps) => {
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
              <Link href={userId ? `/profile/${userId}` : "/"}>
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-orange-500 text-black font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <Button
              className="bg-sigButton hover:bg-sigButtonHover text-white rounded-full h-8 w-8 relative p-2"
              onClick={() => setNewChatOpen(true)}
              title="Новый чат"
            >
              <Image src={"/chat.svg"} fill alt="Новый чат" />
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

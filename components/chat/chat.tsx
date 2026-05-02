import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { ImageMessageSvg, TextMessageSent, TextMessageSvgReceived } from "../svgs/chatSvg";
import { ChatEntry } from "@/types/supabase";

type ChatProps = {
  chat: ChatEntry;
};

const Chat = ({ chat }: ChatProps) => {
  const userToChat = chat.participants[0];
  const lastMessage = chat.lastMessage;
  const lastMessageType = lastMessage?.message_type;
  const formattedDate = lastMessage
    ? formatDate(new Date(lastMessage.created_at))
    : formatDate(new Date());
  const amISender = lastMessage ? lastMessage.sender_id !== userToChat?.id : false;
  const isMsgOpened = lastMessage?.opened;

  let messageStatus: string;
  let iconComponent: JSX.Element;

  if (amISender) {
    messageStatus = isMsgOpened ? "Opened" : "Sent";
    iconComponent =
      lastMessageType === "text" ? (
        <TextMessageSent className={isMsgOpened ? "text-sigSnapChat" : "text-sigSnapChat fill-current"} />
      ) : (
        <ImageMessageSvg className={isMsgOpened ? "text-sigSnapImg" : "text-sigSnapImg fill-current"} />
      );
  } else {
    if (!lastMessage) {
      iconComponent = <TextMessageSvgReceived className="fill-current" />;
      messageStatus = "Say Hi!";
    } else {
      messageStatus = isMsgOpened ? "Received" : "Show Message";
      iconComponent =
        lastMessageType === "text" ? (
          <TextMessageSvgReceived
            className={!isMsgOpened ? "text-sigSnapChat fill-current" : "text-sigSnapChat"}
          />
        ) : (
          <ImageMessageSvg className={!isMsgOpened ? "text-sigSnapImg fill-current" : "text-sigSnapImg"} />
        );
    }
  }

  const initials = userToChat?.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || userToChat?.email[0]?.toUpperCase();

  return (
    <Link href={`/chat/${userToChat?.id}`}>
      <li className="flex items-center p-2 bg-sigSurface hover:bg-sigBackgroundFeedHover cursor-pointer border-b border-b-sigColorBgBorder">
        <Avatar className="w-14 h-14 bg-black">
          <AvatarImage
            src={userToChat?.avatar_url || "https://questhowth.ie/wp-content/uploads/2018/04/user-placeholder.png"}
          />
          <AvatarFallback className="bg-yellow-400 text-black font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="ml-3">
          <p>{userToChat?.full_name || userToChat?.email}</p>
          <p className="text-gray-400 text-xs flex gap-1">
            {iconComponent}
            {messageStatus} - {formattedDate}
          </p>
        </div>
        <Image
          src={"/camera.svg"}
          height={0}
          width={0}
          style={{ width: "20px", height: "auto" }}
          className="ml-auto hover:scale-95"
          alt="Camera Icon"
        />
      </li>
    </Link>
  );
};

export default Chat;

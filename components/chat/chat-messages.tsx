"use client";
import { Message } from "@/types/supabase";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ChatMessagesProps = {
  messages: Message[];
  authUserId: string;
};

const ChatMessages = ({ messages, authUserId }: ChatMessagesProps) => {
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const [isPreviewingImage, setIsPreviewingImage] = useState({ open: false, imgURL: "" });

  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.map((message, idx) => {
        const amISender = message.sender_id === authUserId;
        const senderName = (message.sender?.full_name || message.sender?.email || "").toUpperCase();
        const isMessageImage = message.message_type === "image";
        const isPrevFromSameSender =
          idx > 0 && messages[idx - 1].sender_id === message.sender_id;

        return (
          <div key={message.id} className="w-full" ref={lastMsgRef}>
            {!isPrevFromSameSender && (
              <p
                className={`font-bold mt-2 text-xs ${
                  amISender ? "text-sigSnapImg" : "text-sigSnapChat"
                }`}
              >
                {amISender ? "ME" : senderName}
              </p>
            )}
            <div
              className={`border-l-2 ${
                amISender ? "border-l-sigSnapImg" : "border-l-sigSnapChat"
              }`}
            >
              <div className="flex items-center w-1/2 p-2 rounded-sm">
                {isMessageImage ? (
                  <div className="relative">
                    <Image
                      src={message.content}
                      width={200}
                      height={200}
                      className="h-auto w-auto object-cover cursor-pointer"
                      alt="Image"
                      onLoad={() => lastMsgRef.current?.scrollIntoView({ behavior: "smooth" })}
                      onClick={() => setIsPreviewingImage({ open: true, imgURL: message.content })}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Dialog
        open={isPreviewingImage.open}
        onOpenChange={() => setIsPreviewingImage({ open: false, imgURL: "" })}
      >
        <DialogContent
          className="max-w-4xl h-3/4 bg-sigMain border border-sigColorBgBorder outline-none"
          autoFocus={false}
        >
          <Image src={isPreviewingImage.imgURL} fill className="object-contain p-2" alt="image" />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ChatMessages;

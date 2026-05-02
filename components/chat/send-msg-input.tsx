"use client";
import { EmojiPopover } from "./emoji-popover";
import { TextMessageSent } from "../svgs/chatSvg";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { sendMessageAction } from "@/lib/action";
import { Languages, Loader2, X } from "lucide-react";

const TRANSLATE_DEBOUNCE_MS = 900;

async function translateToRussian(text: string): Promise<string> {
    const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!res.ok) return text;
    const json = await res.json();
    return json?.[0]?.map((part: [string]) => part[0]).join("") ?? text;
}

const SendMsgInput = () => {
    const [messageContent, setMessageContent] = useState("");
    const [translated, setTranslated] = useState("");
    const [showTranslation, setShowTranslation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const params = useParams<{ id: string }>();
    const receiverId = params.id;

    useEffect(() => {
        if (!messageContent.trim()) {
            setTranslated("");
            setShowTranslation(false);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsTranslating(true);
            const result = await translateToRussian(messageContent);
            // Only show translation if it differs from the original
            if (result && result.trim() !== messageContent.trim()) {
                setTranslated(result);
                setShowTranslation(true);
            } else {
                setShowTranslation(false);
            }
            setIsTranslating(false);
        }, TRANSLATE_DEBOUNCE_MS);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [messageContent]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toSend = showTranslation && translated ? translated : messageContent;
        if (!toSend.trim()) return;
        setIsLoading(true);
        try {
            await sendMessageAction(receiverId, toSend, "text");
            setMessageContent("");
            setTranslated("");
            setShowTranslation(false);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1 py-1">
            {/* Translation preview */}
            {showTranslation && translated && (
                <div className="mx-2 px-3 py-2 bg-sigBackgroundSecondaryHover rounded-xl text-sm flex items-start gap-2">
                    <Languages className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
                    <span className="flex-1 text-white/90">{translated}</span>
                    <button onClick={() => setShowTranslation(false)} className="text-gray-500 hover:text-white shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            <div className="flex gap-2 items-center">
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-1 bg-sigBackgroundSecondaryHover rounded-full border border-sigColorBgBorder">
                    <Input
                        placeholder="Написать сообщение"
                        className="bg-transparent focus:outline-transparent border-none outline-none w-full h-full rounded-full"
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        disabled={isLoading}
                    />
                    {isTranslating && (
                        <span className="pr-2">
                            <Languages className="w-4 h-4 text-orange-400 animate-pulse" />
                        </span>
                    )}
                    <Button size="sm" className="bg-transparent hover:bg-transparent text-sigSnapChat" type="submit">
                        {!isLoading && <TextMessageSent className="scale-150 mr-1" />}
                        {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                    </Button>
                </form>
                <div className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-white bg-sigBackgroundSecondaryHover">
                    <EmojiPopover />
                </div>
            </div>
        </div>
    );
};

export default SendMsgInput;

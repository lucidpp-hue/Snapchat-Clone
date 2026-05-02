"use client";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, User } from "lucide-react";
import { useState } from "react";
import NewPostDialog from "./new-post-dialog";

export default function SpotlightNav({ userId }: { userId: string }) {
  const [newPostOpen, setNewPostOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" width={32} height={32} alt="PeytOtoria" className="rounded-lg" />
          <span className="font-bold text-orange-400 text-lg">PeytOtoria</span>
        </Link>

        <h1 className="font-bold text-white text-base">Обзор</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewPostOpen(true)}
            className="bg-orange-500 hover:bg-orange-400 transition-colors text-white text-sm font-semibold px-4 py-1.5 rounded-full"
          >
            + Пост
          </button>
          <Link href={`/profile/${userId}`} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/chat" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <MessageCircle className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <NewPostDialog open={newPostOpen} onClose={() => setNewPostOpen(false)} />
    </>
  );
}

"use client";
import { Post } from "@/types/supabase";
import { likePostAction } from "@/lib/action";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Share2 } from "lucide-react";
import { useState, useTransition } from "react";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`;
  return String(n);
}

type Props = {
  post: Post;
  initialLiked: boolean;
  currentUserId: string;
};

export default function PostCard({ post, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [heartBurst, setHeartBurst] = useState(false);
  const [isPending, startTransition] = useTransition();

  const author = post.author;
  const initials = author?.full_name
    ? author.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : author?.email?.[0]?.toUpperCase() ?? "?";

  const handleLike = () => {
    if (isPending) return;
    // Trigger heart burst animation
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);

    startTransition(async () => {
      const nowLiked = await likePostAction(post.id);
      setLiked(nowLiked);
      setLikesCount((c) => (nowLiked ? c + 1 : Math.max(c - 1, 0)));
    });
  };

  return (
    <article className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${author?.id}`}>
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden shrink-0">
            {author?.avatar_url ? (
              <Image src={author.avatar_url} alt={author.full_name} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <span className="text-sm font-bold text-black">{initials}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${author?.id}`} className="font-semibold text-sm hover:text-orange-400 transition-colors truncate block">
            {author?.full_name || author?.email || "Пользователь"}
          </Link>
          <p className="text-gray-500 text-xs">
            {new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm text-gray-100 leading-relaxed">{post.content}</p>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full aspect-video bg-gray-900">
          <Image src={post.image_url} alt="Пост" fill className="object-cover" />
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-gray-800">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 group select-none"
          disabled={isPending}
        >
          <span className="relative flex items-center justify-center w-8 h-8">
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? "text-red-500 fill-red-500" : "text-gray-400 group-hover:text-red-400"}`}
              style={{
                transform: heartBurst ? "scale(1.6)" : "scale(1)",
                transition: heartBurst
                  ? "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)"
                  : "transform 0.25s ease",
              }}
            />
            {heartBurst && (
              <span
                className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                style={{ animationDuration: "0.5s", animationIterationCount: 1 }}
              />
            )}
          </span>
          <span className="text-xs text-gray-400 tabular-nums">{formatCount(likesCount)}</span>
        </button>

        {/* Views */}
        <div className="flex items-center gap-1.5">
          <Eye className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-400 tabular-nums">{formatCount(post.views_count)}</span>
        </div>

        {/* Shares */}
        <div className="flex items-center gap-1.5">
          <Share2 className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-400 tabular-nums">{formatCount(post.shares_count)}</span>
        </div>
      </div>
    </article>
  );
}

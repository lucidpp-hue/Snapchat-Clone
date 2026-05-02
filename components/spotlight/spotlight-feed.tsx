"use client";
import { Post } from "@/types/supabase";
import PostCard from "./post-card";

type Props = {
  posts: Post[];
  likedPostIds: string[];
  currentUserId: string;
};

export default function SpotlightFeed({ posts, likedPostIds, currentUserId }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <p className="text-lg font-semibold">Постов пока нет</p>
        <p className="text-sm mt-1">Будьте первым — нажмите &quot;+ Пост&quot;</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          initialLiked={likedPostIds.includes(post.id)}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

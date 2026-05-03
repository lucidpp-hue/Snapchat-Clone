"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Profile, Story } from "@/types/supabase";
import { followAction, updateProfileAction, createStoryAction, likeStoryAction, incrementStoryViewAction } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Camera, Heart, Eye, Plus, X, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";

type Props = {
  profile: Profile;
  isOwner: boolean;
  initialFollowing: boolean;
  currentUserId: string;
  initialStories: Story[];
  initialLikedStoryIds: string[];
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`;
  return n.toString();
}

function StoryCard({
  story,
  initialLiked,
  isOwner,
}: {
  story: Story;
  initialLiked: boolean;
  isOwner: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [heartBurst, setHeartBurst] = useState(false);
  const [views, setViews] = useState(story.views_count);
  const [isPending, startTransition] = useTransition();
  const viewedRef = useRef(false);

  const handleView = () => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    incrementStoryViewAction(story.id);
    setViews((v) => v + 1);
  };

  const handleLike = () => {
    startTransition(async () => {
      const nowLiked = await likeStoryAction(story.id);
      setLiked(nowLiked);
      if (nowLiked) {
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 600);
      }
    });
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group"
      style={{ aspectRatio: "9/16" }}
      onClick={handleView}
    >
      {story.image_url && (
        <Image src={story.image_url} alt="История" fill className="object-cover" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Caption */}
      {story.caption && (
        <p className="absolute bottom-10 left-3 right-3 text-white text-xs font-medium leading-snug line-clamp-2">
          {story.caption}
        </p>
      )}

      {/* View count */}
      <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white/80 text-xs">
        <Eye className="w-3 h-3" />
        <span>{formatCount(views)}</span>
      </div>

      {/* Like button */}
      {!isOwner && (
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          disabled={isPending}
          className="absolute bottom-2 right-3 flex items-center justify-center"
        >
          <span className="relative flex items-center justify-center w-7 h-7">
            <Heart
              className={`w-5 h-5 transition-all duration-150 ${
                liked ? "text-red-500 fill-red-500" : "text-white/80 hover:text-red-400"
              } ${heartBurst ? "scale-150" : "scale-100"}`}
            />
            {heartBurst && (
              <span className="absolute inset-0 rounded-full bg-red-500/30 animate-heart-burst pointer-events-none" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}

export default function ProfileClient({
  profile,
  isOwner,
  initialFollowing,
  currentUserId,
  initialStories,
  initialLikedStoryIds,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [following, setFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(profile.followers_count);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>(initialStories);

  // New story dialog state
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [uploadingStory, setUploadingStory] = useState(false);

  const pfpRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-pfp", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) {
      setAvatarUrl(json.url);
      await updateProfileAction({ avatar_url: json.url });
    }
    setUploading(false);
  };

  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryFile(file);
    setStoryPreview(URL.createObjectURL(file));
  };

  const handlePostStory = async () => {
    if (!storyFile) return;
    setUploadingStory(true);
    setStoryError(null);
    try {
      const fd = new FormData();
      fd.append("file", storyFile);
      const res = await fetch("/api/upload-story", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setStoryError(json.error || "Не удалось загрузить фото. Попробуйте снова.");
        return;
      }
      await createStoryAction(json.url, storyCaption);
      const newStory: Story = {
        id: crypto.randomUUID(),
        author_id: profile.id,
        image_url: json.url,
        caption: storyCaption,
        views_count: 0,
        likes_count: 0,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      setStories((prev) => [newStory, ...prev]);
      setStoryDialogOpen(false);
      setStoryCaption("");
      setStoryPreview(null);
      setStoryFile(null);
    } catch (err) {
      setStoryError("Произошла ошибка. Попробуйте снова.");
      console.error("[v0] story upload error:", err);
    } finally {
      setUploadingStory(false);
    }
  };

  const handleFollow = () => {
    startTransition(async () => {
      const nowFollowing = await followAction(profile.id);
      setFollowing(nowFollowing);
      setFollowersCount((c) => (nowFollowing ? c + 1 : Math.max(c - 1, 0)));
    });
  };

  const handleSaveBio = () => {
    startTransition(async () => {
      await updateProfileAction({ bio });
      setEditingBio(false);
    });
  };

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || profile.email[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Orange banner */}
      <div className="h-32 bg-gradient-to-br from-orange-600 to-orange-400" />

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            {/* Orange ring like Snapchat story ring */}
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-orange-500 to-orange-300">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-orange-500 flex items-center justify-center relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Фото профиля" fill className="object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-black">{initials}</span>
                )}
              </div>
            </div>
            {isOwner && (
              <>
                <button
                  onClick={() => pfpRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-400 rounded-full p-1.5 border-2 border-black transition-colors"
                  disabled={uploading}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={pfpRef} type="file" accept="image/*" className="hidden" onChange={handlePfpChange} />
              </>
            )}
          </div>

          <div className="flex gap-2 pb-1">
            {isOwner ? (
              <>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-400 text-white rounded-full px-4 flex gap-1 items-center"
                  onClick={() => setStoryDialogOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" /> История
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-full px-4"
                  onClick={() => setEditingBio(true)}
                >
                  Редактировать
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-full px-4 flex gap-1 items-center"
                >
                  <Link href={`/chat/${profile.id}`}>
                    <MessageCircle className="w-4 h-4" /> Написать
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={isPending}
                  className={`rounded-full px-4 flex items-center gap-1.5 ${
                    following ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-orange-500 hover:bg-orange-400 text-white"
                  }`}
                >
                  {following ? (
                    <><UserCheck className="w-4 h-4" /> Вы подписаны</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Подписаться</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name, email, bio */}
        <div className="mb-5">
          <h1 className="text-lg font-bold leading-tight">{profile.full_name || profile.email}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          {editingBio ? (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                className="bg-gray-900 border border-gray-700 rounded-xl p-2 text-sm text-white resize-none w-full focus:outline-none focus:border-orange-500"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите о себе..."
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-white rounded-full px-4" onClick={handleSaveBio} disabled={isPending}>Сохранить</Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white rounded-full" onClick={() => setEditingBio(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            bio && <p className="mt-2 text-sm text-gray-300 leading-relaxed">{bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 border-t border-gray-800 pt-4 mb-6">
          <div className="text-center">
            <p className="font-bold text-base">{followersCount.toLocaleString("ru-RU")}</p>
            <p className="text-gray-400 text-xs">Подписчики</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-base">{profile.following_count.toLocaleString("ru-RU")}</p>
            <p className="text-gray-400 text-xs">Подписки</p>
          </div>
        </div>

        {/* Stories grid */}
        <div className="pb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Истории · {stories.length}
          </h2>
          {stories.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-10">
              {isOwner ? "Нажмите «История», чтобы поделиться первым моментом." : "Историй пока нет."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  initialLiked={initialLikedStoryIds.includes(story.id)}
                  isOwner={isOwner}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New story — step 1: pick image (small dialog) */}
      {storyDialogOpen && !storyPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Новая история</h3>
              <button onClick={() => { setStoryDialogOpen(false); setStoryPreview(null); setStoryFile(null); setStoryCaption(""); setStoryError(null); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div
              className="rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-700 hover:border-orange-500 transition-colors"
              style={{ aspectRatio: "9/16" }}
              onClick={() => storyFileRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Plus className="w-10 h-10" />
                <span className="text-sm">Выбрать фото</span>
              </div>
            </div>
            <input ref={storyFileRef} type="file" accept="image/*" className="hidden" onChange={handleStoryFileChange} />
          </div>
        </div>
      )}

      {/* New story — step 2: full-screen composer once image is picked */}
      {storyDialogOpen && storyPreview && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Full-screen background image */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={storyPreview} alt="Предпросмотр" className="w-full h-full object-cover" />
            {/* Gradient overlays top + bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
          </div>

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-2">
            <button
              onClick={() => { setStoryPreview(null); setStoryFile(null); setStoryError(null); }}
              className="bg-black/40 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => storyFileRef.current?.click()}
              className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm hover:bg-black/60 transition-colors"
            >
              Изменить фото
            </button>
          </div>
          <input ref={storyFileRef} type="file" accept="image/*" className="hidden" onChange={handleStoryFileChange} />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: caption + post button */}
          <div className="relative z-10 px-4 pb-10 flex flex-col gap-3">
            {storyError && (
              <p className="text-red-400 text-sm text-center bg-black/50 rounded-xl px-3 py-2">{storyError}</p>
            )}
            <textarea
              className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-sm text-white resize-none focus:outline-none focus:border-orange-400 placeholder-white/60"
              rows={2}
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Добавьте подпись..."
            />
            <Button
              className="bg-orange-500 hover:bg-orange-400 text-white rounded-full w-full py-3 text-base font-semibold shadow-lg disabled:opacity-60"
              disabled={uploadingStory}
              onClick={handlePostStory}
            >
              {uploadingStory ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Публикация...
                </span>
              ) : "Опубликовать историю"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

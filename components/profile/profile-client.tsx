"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Profile } from "@/types/supabase";
import { followAction, updateProfileAction } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Camera, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";

type Props = {
  profile: Profile;
  isOwner: boolean;
  initialFollowing: boolean;
  currentUserId: string;
};

export default function ProfileClient({ profile, isOwner, initialFollowing, currentUserId }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [following, setFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(profile.followers_count);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-pfp", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setAvatarUrl(json.url);
    setUploading(false);
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
      {/* Header banner */}
      <div className="h-36 bg-gradient-to-br from-orange-600 to-orange-400" />

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-14 mb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-orange-500 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Фото профиля"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-black">{initials}</span>
              )}
            </div>
            {isOwner && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-400 rounded-full p-1.5 transition-colors"
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePfpChange}
                />
              </>
            )}
          </div>

          <div className="flex gap-2 pb-1">
            {isOwner ? (
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-full px-5"
                onClick={() => setEditingBio(true)}
              >
                Редактировать
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-full"
                >
                  <Link href={`/chat/${profile.id}`}>
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={isPending}
                  className={`rounded-full px-5 flex items-center gap-1.5 ${
                    following
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-orange-500 hover:bg-orange-400 text-white"
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

        {/* Name + bio */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">{profile.full_name || profile.email}</h1>
          <p className="text-gray-400 text-sm">{profile.email}</p>

          {editingBio ? (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white resize-none w-full focus:outline-none focus:border-orange-500"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите о себе..."
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-white rounded-full px-4" onClick={handleSaveBio} disabled={isPending}>
                  Сохранить
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white rounded-full" onClick={() => setEditingBio(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-200 leading-relaxed">{bio || (isOwner ? "Добавьте описание..." : "")}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 border-t border-gray-800 pt-4">
          <div className="text-center">
            <p className="font-bold text-lg">{followersCount.toLocaleString("ru-RU")}</p>
            <p className="text-gray-400 text-xs">Подписчики</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{profile.following_count.toLocaleString("ru-RU")}</p>
            <p className="text-gray-400 text-xs">Подписки</p>
          </div>
        </div>
      </div>
    </div>
  );
}

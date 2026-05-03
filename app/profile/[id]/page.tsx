import { createClient } from "@/lib/supabase/server";
import { getUserProfile, isFollowing, getStoriesForProfile, getLikedStoryIds } from "@/lib/data";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/profile-client";

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, stories, likedStoryIds, following] = await Promise.all([
    getUserProfile(id),
    getStoriesForProfile(id),
    getLikedStoryIds(user.id),
    user.id === id ? Promise.resolve(false) : isFollowing(user.id, id),
  ]);

  return (
    <ProfileClient
      profile={profile}
      isOwner={user.id === id}
      initialFollowing={following}
      currentUserId={user.id}
      initialStories={stories}
      initialLikedStoryIds={likedStoryIds}
    />
  );
};

export default ProfilePage;

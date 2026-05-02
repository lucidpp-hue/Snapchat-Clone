import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/data";
import { isFollowing } from "@/lib/data";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/profile-client";

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile(id);
  const isOwner = user.id === id;
  const following = isOwner ? false : await isFollowing(user.id, id);

  return (
    <ProfileClient
      profile={profile}
      isOwner={isOwner}
      initialFollowing={following}
      currentUserId={user.id}
    />
  );
};

export default ProfilePage;

import { createClient } from "@/lib/supabase/server";
import { getPosts, getLikedPostIds } from "@/lib/data";
import { redirect } from "next/navigation";
import SpotlightFeed from "@/components/spotlight/spotlight-feed";
import SpotlightNav from "@/components/spotlight/spotlight-nav";

export default async function SpotlightPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const posts = await getPosts();
  const likedIds = await getLikedPostIds(user.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <SpotlightNav userId={user.id} />
      <SpotlightFeed posts={posts} likedPostIds={likedIds} currentUserId={user.id} />
    </div>
  );
}

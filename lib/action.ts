"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export const sendMessageAction = async (
  receiverId: string,
  content: string,
  messageType: "image" | "text"
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content,
    message_type: messageType,
    opened: false,
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath(`/chat/${receiverId}`);
  return data;
};

export const deleteChatAction = async (otherUserId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("messages")
    .delete()
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    );

  if (error) throw new Error(error.message);
  revalidatePath("/chat/[id]", "page");
  redirect("/chat");
};

export const markMessageOpenedAction = async (messageId: string) => {
  const supabase = await createClient();
  await supabase.from("messages").update({ opened: true }).eq("id", messageId);
  revalidatePath("/chat/[id]", "page");
};

export const createPostAction = async (content: string, imageUrl: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    content,
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/spotlight");
};

export const likePostAction = async (postId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId);
  } else {
    await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId });
  }

  revalidatePath("/spotlight");
  return !existing;
};

export const followAction = async (targetUserId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
  }

  revalidatePath(`/profile/${targetUserId}`);
  return !existing;
};

export const createStoryAction = async (imageUrl: string, caption: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("stories").insert({
    author_id: user.id,
    image_url: imageUrl,
    caption,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/profile/${user.id}`);
};

export const likeStoryAction = async (storyId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("story_likes")
    .select("story_id")
    .eq("user_id", user.id)
    .eq("story_id", storyId)
    .maybeSingle();

  if (existing) {
    await supabase.from("story_likes").delete().eq("user_id", user.id).eq("story_id", storyId);
  } else {
    await supabase.from("story_likes").insert({ user_id: user.id, story_id: storyId });
  }

  return !existing;
};

export const incrementStoryViewAction = async (storyId: string) => {
  const supabase = await createClient();
  await supabase.rpc("increment_story_views", { story_id: storyId });
};

export const updateProfileAction = async (formData: { full_name?: string; bio?: string; avatar_url?: string }) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/profile/${user.id}`);
};

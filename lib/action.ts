"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/data";

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

  const conversationId = await getOrCreateConversation(user.id, receiverId);

  const { data, error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
    image_url: messageType === "image" ? content : null,
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

  // Find the shared conversation
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((r: { conversation_id: string }) => r.conversation_id);
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvIds);

    if (shared && shared.length > 0) {
      const conversationId = shared[0].conversation_id;
      await supabase.from("messages").delete().eq("conversation_id", conversationId);
      await supabase.from("conversations").delete().eq("id", conversationId);
    }
  }

  revalidatePath("/chat/[id]", "page");
  redirect("/chat");
};

export const markMessageOpenedAction = async (messageId: string) => {
  const supabase = await createClient();
  await supabase.from("messages").update({ opened: true }).eq("id", messageId);
  revalidatePath("/chat/[id]", "page");
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
    user_id: user.id,
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/profile/${user.id}`);
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

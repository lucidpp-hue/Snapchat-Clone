import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { ChatEntry, Message, Profile, Story } from "@/types/supabase";

export const getUsersForSidebar = async (authUserId: string): Promise<ChatEntry[]> => {
  noStore();
  const supabase = await createClient();

  // Get all other profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", authUserId);

  if (error || !profiles) return [];

  // For each profile, find or reference the most recent direct message
  const chatEntries: ChatEntry[] = await Promise.all(
    profiles.map(async (profile: Profile) => {
      // Find conversation between the two users
      const { data: convRows } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", authUserId);

      let lastMsg = null;
      if (convRows && convRows.length > 0) {
        const convIds = convRows.map((r) => r.conversation_id);
        const { data: otherRows } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", profile.id)
          .in("conversation_id", convIds);

        if (otherRows && otherRows.length > 0) {
          const sharedConvIds = otherRows.map((r) => r.conversation_id);
          const { data: msg } = await supabase
            .from("messages")
            .select("*")
            .in("conversation_id", sharedConvIds)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          lastMsg = msg ?? null;
        }
      }

      return {
        _id: profile.id,
        participants: [profile],
        lastMessage: lastMsg,
      };
    })
  );

  return chatEntries;
};

export const getUserProfile = async (userId: string): Promise<Profile> => {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error("User not found");
  return data as Profile;
};

// Returns or creates a conversation between two users, returning the conversationId
export const getOrCreateConversation = async (
  authUserId: string,
  otherUserId: string
): Promise<string> => {
  const supabase = await createClient();

  // Find existing shared conversation
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", authUserId);

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((r) => r.conversation_id);
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvIds);

    if (shared && shared.length > 0) {
      return shared[0].conversation_id;
    }
  }

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (error || !newConv) throw new Error("Could not create conversation");

  await supabase.from("conversation_participants").insert([
    { conversation_id: newConv.id, user_id: authUserId },
    { conversation_id: newConv.id, user_id: otherUserId },
  ]);

  return newConv.id;
};

export const getMessages = async (authUserId: string, otherUserId: string): Promise<Message[]> => {
  noStore();
  const supabase = await createClient();

  // Find shared conversation
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", authUserId);

  if (!myConvs || myConvs.length === 0) return [];

  const myConvIds = myConvs.map((r) => r.conversation_id);
  const { data: shared } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", otherUserId)
    .in("conversation_id", myConvIds);

  if (!shared || shared.length === 0) return [];

  const conversationId = shared[0].conversation_id;

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Message[];
};

export const getStoriesForProfile = async (profileId: string): Promise<Story[]> => {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", profileId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Story[];
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  noStore();
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
};

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { ChatEntry, Message, Profile } from "@/types/supabase";

export const getUsersForSidebar = async (authUserId: string): Promise<ChatEntry[]> => {
  noStore();
  const supabase = await createClient();

  // Get all other profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", authUserId);

  if (error || !profiles) return [];

  // For each profile, find the most recent message exchanged
  const chatEntries: ChatEntry[] = await Promise.all(
    profiles.map(async (profile: Profile) => {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${authUserId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${authUserId})`
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        _id: profile.id,
        participants: [profile],
        lastMessage: lastMsg ?? null,
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

export const getMessages = async (authUserId: string, otherUserId: string): Promise<Message[]> => {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*)")
    .or(
      `and(sender_id.eq.${authUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${authUserId})`
    )
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Message[];
};

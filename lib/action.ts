"use server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  let finalContent = content;
  if (messageType === "image") {
    const uploaded = await cloudinary.uploader.upload(content);
    finalContent = uploaded.secure_url;
  }

  const { data, error } = await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: finalContent,
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

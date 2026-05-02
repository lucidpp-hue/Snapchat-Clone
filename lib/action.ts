"use server";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { connectToMongoDB } from "./db";
import { v2 as cloudinary } from "cloudinary";
import Message, { IMessageDocument } from "@/models/messageModel";
import Chat, { IChatDocument } from "@/models/chatModel";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function logoutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export const sendMessageAction = async (receiverId: string, content: string, messageType: "image" | "text") => {
    noStore();
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await connectToMongoDB();
        const senderId = user.id;

        let uploadedResponse;
        if (messageType === "image") {
            uploadedResponse = await cloudinary.uploader.upload(content);
        }

        const newMessage: IMessageDocument = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: uploadedResponse?.secure_url || content,
            messageType,
        });

        let chat: IChatDocument | null = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId],
                messages: [newMessage._id],
            });
        } else {
            chat.messages.push(newMessage._id);
            await chat.save();
        }

        revalidatePath(`/chat/${receiverId}`);

        return newMessage;
    } catch (error: any) {
        console.error("Error in sendMessage:", error.message);
        throw error;
    }
};

export const deleteChatAction = async (userId: string) => {
    try {
        await connectToMongoDB();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const chat = await Chat.findOne({ participants: { $all: [user.id, userId] } });
        if (!chat) return;

        const messageIds = chat.messages.map((messageId: any) => messageId.toString());
        await Message.deleteMany({ _id: { $in: messageIds } });
        await Chat.deleteOne({ _id: chat._id });

        revalidatePath("/chat/[id]", "page");
    } catch (error: any) {
        console.error("Error in deleteChat:", error.message);
        throw error;
    }
    redirect("/chat");
};

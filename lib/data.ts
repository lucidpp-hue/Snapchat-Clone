import Message, { IMessageDocument } from "@/models/messageModel";
import User, { IUserDocument } from "@/models/userModel"
import { connectToMongoDB } from "./db";
import { unstable_noStore as noStore } from "next/cache";
import Chat, { IChatDocument } from "@/models/chatModel";

export const getUsersForSidebar = async (authUserId: string) => {
    noStore();
    try {
        await connectToMongoDB();
        const allUsers: IUserDocument[] = await User.find({ supabaseId: { $ne: authUserId } });

        const usersInfo = await Promise.all(
            allUsers.map(async (user) => {
                const lastMessage: IMessageDocument | null = await Message.findOne({
                    $or: [
                        { sender: user.supabaseId, receiver: authUserId },
                        { sender: authUserId, receiver: user.supabaseId },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .exec();

                return {
                    _id: user.supabaseId,
                    participants: [user],
                    lastMessage: lastMessage ? lastMessage.toJSON() : null,
                };
            })
        );
        return usersInfo;
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error);
        throw error;
    }
}

export const getUserProfile = async (supabaseId: string) => {
    noStore();
    try {
        await connectToMongoDB();
        const user: IUserDocument | null = await User.findOne({ supabaseId });
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        console.log("Error in getUserProfile: ", error);
        throw error;
    }
};

export const getMessages = async (authUserId: string, otherUserId: string) => {
    noStore();
    try {
        await connectToMongoDB();

        const chat: IChatDocument | null = await Chat.findOne({
            participants: { $all: [authUserId, otherUserId] },
        }).populate({
            path: "messages",
            populate: {
                path: "sender",
                model: "User",
                select: "fullName",
                localField: "sender",
                foreignField: "supabaseId",
            },
        });

        if (!chat) return [];

        const messages = chat.messages;
        return JSON.parse(JSON.stringify(messages));
    } catch (error) {
        console.log("Error in getMessages: ", error);
        throw error;
    }
};

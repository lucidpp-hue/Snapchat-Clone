import mongoose, { Document, Model } from "mongoose";

export interface IUser {
    supabaseId: string;
    fullName: string;
    email: string;
    avatar?: string;
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>({
    supabaseId: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});

const User: Model<IUserDocument> = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: "text" | "image";
  opened: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
};

export type ChatEntry = {
  _id: string; // the other user's id
  participants: Profile[];
  lastMessage: Message | null;
};

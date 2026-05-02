export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
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
  _id: string;
  participants: Profile[];
  lastMessage: Message | null;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  image_url: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

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
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  opened: boolean;
  created_at: string;
  sender?: Profile;
};

export type ChatEntry = {
  _id: string;
  participants: Profile[];
  lastMessage: Message | null;
};

export type Story = {
  id: string;
  user_id: string;
  image_url: string;
  expires_at: string;
  created_at: string;
  // UI-only fields (not in DB but used in components)
  author_id?: string;
  caption?: string;
  views_count?: number;
  likes_count?: number;
  author?: Profile;
};

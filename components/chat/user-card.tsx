import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Profile } from "@/types/supabase";

type UserCardProps = {
  user: Profile;
  handleSelectUser: (user: Profile) => void;
  selectedUser: Profile | null;
};

const UserCard = ({ user, handleSelectUser, selectedUser }: UserCardProps) => {
  const isSelected = selectedUser?.id === user.id;
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.email[0]?.toUpperCase();

  return (
    <div
      onClick={() => handleSelectUser(user)}
      className={`flex items-center gap-2 border-b border-b-sigColorBgBorder p-1 hover:bg-sigBackgroundFeedHover cursor-pointer ${
        isSelected ? "bg-sigBackgroundFeedHover" : ""
      }`}
    >
      <Avatar className="cursor-pointer hover:bg-sigBackgroundSecondaryHover">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback className="bg-orange-500 text-black text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span>{user.full_name || user.email}</span>
    </div>
  );
};
export default UserCard;

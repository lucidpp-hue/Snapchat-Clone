import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/supabase";

const ChatUserInfo = ({ userData }: { userData: Profile }) => {
  const initials = userData.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || userData.email[0]?.toUpperCase();

  return (
    <div className="cursor-pointer bg-sigButtonSecondary hover:bg-sigButtonSecondaryHover rounded-full flex gap-2 items-center py-1 px-3 text-white font-semibold">
      <Avatar className="h-8 w-8 rounded-full flex items-center justify-center">
        <AvatarImage src={userData.avatar_url || "/logo.svg"} />
        <AvatarFallback className="bg-yellow-400 text-black text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span>{userData.full_name || userData.email}</span>
    </div>
  );
};
export default ChatUserInfo;

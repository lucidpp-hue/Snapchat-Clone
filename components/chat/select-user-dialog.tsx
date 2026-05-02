"use client";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { TextMessageSent } from "../svgs/chatSvg";
import { Loader2, SearchIcon } from "lucide-react";
import UserCard from "./user-card";
import { useEffect, useState } from "react";
import { Profile } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/action";

type SelectUserDialogProps = {
  selectedFile: string;
  onClose: () => void;
  onPrev: () => void;
};

const SelectUserDialog = ({ selectedFile, onClose, onPrev }: SelectUserDialogProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const res = await fetch("/api/chat/get-users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    getUsers();
  }, []);

  const handleSelectUser = (user: Profile) => setSelectedUser(user);

  const handleSendMessage = async () => {
    if (!selectedUser) return;
    setIsSendingMessage(true);
    try {
      await sendMessageAction(selectedUser.id, selectedFile, "image");
      router.push(`/chat/${selectedUser.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <Dialog open={!!selectedFile}>
      <DialogContent
        className="bg-sigMain border border-sigColorBgBorder text-white max-w-xs"
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <div className="text-gray-400 p-1 flex gap-2 rounded-full bg-sigSurface border border-sigColorBgBorder">
            <SearchIcon className="text-gray-400 w-5" />
            <input
              className="bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none w-full"
              placeholder="To:"
              type="text"
            />
          </div>
          <p className="font-semibold py-2">Chats:</p>
          <div className="flex flex-col max-h-48 bg-sigSurface rounded-md overflow-auto">
            {users.map((user: Profile) => (
              <UserCard
                key={user.id}
                user={user}
                handleSelectUser={handleSelectUser}
                selectedUser={selectedUser}
              />
            ))}
          </div>
          {isFetchingUsers && (
            <div className="flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="mx-auto flex items-center">
          <DialogClose asChild>
            <Button variant="destructive" size="sm" onClick={onClose} className="rounded-full bg-sigSnapImg">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={onPrev} className="rounded-full px-4">
            Prev
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-sigSnapChat hover:bg-sigSnapChat gap-1"
            onClick={handleSendMessage}
            disabled={!selectedUser || isSendingMessage}
          >
            {isSendingMessage ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                Send To <TextMessageSent className="text-white scale-95 my-auto" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectUserDialog;

"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, SearchIcon } from "lucide-react";
import UserCard from "./user-card";
import { useEffect, useState } from "react";
import { Profile } from "@/types/supabase";
import { useRouter } from "next/navigation";

type NewChatDialogProps = {
  open: boolean;
  onClose: () => void;
};

const NewChatDialog = ({ open, onClose }: NewChatDialogProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const getUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const res = await fetch("/api/chat/get-users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
        setFilteredUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    getUsers();
  }, [open]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const handleOpen = () => {
    if (!selectedUser) return;
    router.push(`/chat/${selectedUser.id}`);
    onClose();
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-sigMain border border-sigColorBgBorder text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-white">Новый чат</DialogTitle>
        </DialogHeader>

        <div className="text-gray-400 p-1 flex gap-2 rounded-full bg-sigSurface border border-sigColorBgBorder">
          <SearchIcon className="text-gray-400 w-5 shrink-0" />
          <input
            className="bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none w-full"
            placeholder="Поиск по имени или почте..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p className="font-semibold text-sm">Пользователи:</p>

        <div className="flex flex-col max-h-56 bg-sigSurface rounded-md overflow-auto">
          {isFetchingUsers ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              {search ? "Пользователи не найдены." : "Других пользователей пока нет."}
            </p>
          ) : (
            filteredUsers.map((user: Profile) => (
              <UserCard
                key={user.id}
                user={user}
                handleSelectUser={setSelectedUser}
                selectedUser={selectedUser}
              />
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full text-gray-400 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            size="sm"
            className="rounded-full px-5 bg-orange-500 hover:bg-orange-400 text-white"
            onClick={handleOpen}
            disabled={!selectedUser}
          >
            Открыть чат
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;

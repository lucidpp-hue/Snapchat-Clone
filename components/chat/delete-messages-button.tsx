"use client";
import { Button } from "@/components/ui/button";
import { deleteChatAction } from "@/lib/action";
import { Loader2, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const DeleteMessagesButton = () => {
  const { id: userId } = useParams<{ id: string }>();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteChatAction(userId);
    });
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      className="bg-sigButtonSecondary hover:bg-sigButtonSecondaryHover w-12 h-12 rounded-full"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash />}
    </Button>
  );
};

export default DeleteMessagesButton;

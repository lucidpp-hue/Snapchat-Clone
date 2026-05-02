"use client";
import { useState, useRef, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { createPostAction } from "@/lib/action";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewPostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-post-image", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setImageUrl(json.url);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!content.trim() && !imageUrl) return;
    startTransition(async () => {
      await createPostAction(content, imageUrl);
      setContent("");
      setImageUrl("");
      setImagePreview("");
      onClose();
      router.refresh();
    });
  };

  const handleClose = () => {
    setContent("");
    setImageUrl("");
    setImagePreview("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-gray-950 border border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Новый пост</DialogTitle>
        </DialogHeader>

        <textarea
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500 transition-colors"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Что у вас нового?"
        />

        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden">
            <Image src={imagePreview} alt="Preview" width={400} height={300} className="w-full object-cover rounded-xl max-h-64" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
              </div>
            )}
            {!uploading && (
              <button
                onClick={() => { setImageUrl(""); setImagePreview(""); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-sm transition-colors"
            disabled={uploading}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Фото</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <div className="flex gap-2">
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
              onClick={handleSubmit}
              disabled={isPending || uploading || (!content.trim() && !imageUrl)}
              className="rounded-full px-5 bg-orange-500 hover:bg-orange-400 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Опубликовать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

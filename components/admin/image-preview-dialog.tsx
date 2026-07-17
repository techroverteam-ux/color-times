"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImagePreviewDialogProps {
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSetCover?: (index: number) => void;
  isSettingCover?: boolean;
}

export function ImagePreviewDialog({
  images,
  index,
  onIndexChange,
  onOpenChange,
  title,
  onSetCover,
  isSettingCover,
}: ImagePreviewDialogProps) {
  const open = index >= 0 && index < images.length;
  const src = open ? images[index] : undefined;

  useEffect(() => {
    if (!open || images.length < 2) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, index, images.length, onIndexChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-3 p-4 sm:max-w-xl">
        <DialogTitle className="sr-only">{title ?? "Image preview"}</DialogTitle>
        {src && (
          <>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary sm:aspect-4/3">
              <Image
                src={src}
                alt={title ?? "Product image preview"}
                fill
                sizes="(min-width: 640px) 576px, 100vw"
                className="object-contain"
              />
              {index === 0 && (
                <Badge className="absolute left-2 top-2 gap-1">
                  <Star className="size-3 fill-current" />
                  Cover image
                </Badge>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 hover:bg-background"
                    onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 hover:bg-background"
                    onClick={() => onIndexChange((index + 1) % images.length)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {images.length > 1 ? `Image ${index + 1} of ${images.length}` : "1 image"}
              </p>
              {onSetCover && (
                <Button
                  type="button"
                  size="sm"
                  variant={index === 0 ? "outline" : "default"}
                  disabled={index === 0 || isSettingCover}
                  onClick={() => onSetCover(index)}
                >
                  {isSettingCover ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Star className="size-3.5" />
                  )}
                  {index === 0 ? "Cover image" : "Set as cover image"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

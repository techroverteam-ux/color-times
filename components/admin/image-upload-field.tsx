"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}

export function ImageUploadField({ images, onChange, multiple = false }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Upload failed");
        return;
      }

      onChange(multiple ? [...images, json.data.url] : [json.data.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Network error while uploading");
    } finally {
      setIsUploading(false);
    }
  }

  function addManualUrl() {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    onChange(multiple ? [...images, trimmed] : [trimmed]);
    setManualUrl("");
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, index) => (
            <div
              key={src + index}
              className="relative h-20 w-20 overflow-hidden rounded-md border border-border"
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-charcoal/80 text-ivory"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload Image
        </Button>

        <Input
          placeholder="...or paste an image path/URL"
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addManualUrl();
            }
          }}
          className="max-w-xs"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addManualUrl}>
          Add
        </Button>
      </div>
    </div>
  );
}

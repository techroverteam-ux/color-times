"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";

export function VisitWebsiteLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground", className)}
      >
        <ExternalLink className="h-3 w-3" />
        View Website
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Leave the admin portal?"
        description="This opens the public Color Times Boutique website in a new tab. You'll stay signed in here."
        confirmLabel="Open Website"
        onConfirm={() => {
          window.open("/home", "_blank", "noopener,noreferrer");
          setOpen(false);
        }}
      />
    </>
  );
}

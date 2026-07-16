"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WhatsAppTemplateRow } from "@/components/admin/whatsapp-template-form-dialog";

async function fetchTemplates(): Promise<WhatsAppTemplateRow[]> {
  const res = await fetch("/api/admin/whatsapp/templates");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data.templates;
}

export function WhatsAppTestDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [templateId, setTemplateId] = useState("");

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["admin", "whatsapp", "templates"],
    queryFn: fetchTemplates,
    enabled: open,
  });

  const selectedTemplate = templates.find((t) => t._id === templateId);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, templateId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Test message sent");
      queryClient.invalidateQueries({ queryKey: ["admin", "whatsapp", "logs"] });
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" /> Send Test Message
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test WhatsApp Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                className="mt-2"
                placeholder="919876543210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Template</label>
              {isLoadingTemplates ? (
                <Skeleton className="mt-2 h-9 w-full" />
              ) : (
                <Select value={templateId} onValueChange={(value) => setTemplateId(value ?? "")}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Select a template">
                      {() => selectedTemplate?.name ?? "Select a template"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No templates yet.
                      </div>
                    )}
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!phone || !templateId || mutation.isPending || isLoadingTemplates}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

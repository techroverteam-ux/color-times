"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReturnCondition } from "@/models/Booking";

const CONDITION_OPTIONS: { value: ReturnCondition; label: string }[] = [
  { value: "good", label: "Good — no issues" },
  { value: "minor_damage", label: "Minor damage" },
  { value: "major_damage", label: "Major damage" },
  { value: "missing_items", label: "Missing items" },
];

export function ReturnBookingDialog({
  bookingId,
  open,
  onOpenChange,
  onSuccess,
}: {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [condition, setCondition] = useState<ReturnCondition>("good");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "returned",
          returnCondition: condition,
          returnNotes: notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.booking;
    },
    onSuccess: () => {
      toast.success("Booking marked as returned");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "booking", bookingId] });
      setCondition("good");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as returned</DialogTitle>
          <DialogDescription>
            Record the condition of the dress before closing out this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Condition</label>
            <Select value={condition} onValueChange={(value) => setCondition(value as ReturnCondition)}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue>
                  {(value: string) =>
                    CONDITION_OPTIONS.find((option) => option.value === value)?.label ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              className="mt-2"
              rows={3}
              placeholder="Describe any damage or missing items..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

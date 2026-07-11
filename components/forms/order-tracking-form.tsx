"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trackingSchema, type TrackingInput } from "@/lib/validations/tracking";
import { formatDate } from "@/lib/utils";

interface TrackingResult {
  bookingNumber: string;
  status: string;
  rentalStartDate: string;
  rentalEndDate: string;
  eventDate: string;
}

export function OrderTrackingForm() {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<TrackingInput>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { bookingNumber: "", email: "" },
  });

  async function onSubmit(values: TrackingInput) {
    setServerError(null);
    setResult(null);
    try {
      const res = await fetch("/api/bookings/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(json.data);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="bookingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Number</FormLabel>
                <FormControl>
                  <Input placeholder="CTB-2026-00123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Used at Booking</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button
            type="submit"
            className="w-full rounded-none"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Track Order
          </Button>
        </form>
      </Form>

      {result && (
        <div className="mt-8 rounded-lg border border-border bg-secondary/50 p-6">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-5 w-5 text-accent" />
            <p className="font-heading text-lg">{result.bookingNumber}</p>
          </div>
          <p className="mt-2 text-sm capitalize text-muted-foreground">
            Status: <span className="font-medium text-foreground">{result.status.replace("_", " ")}</span>
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Event Date</p>
              <p className="mt-1">{formatDate(result.eventDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Delivery</p>
              <p className="mt-1">{formatDate(result.rentalStartDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Return By</p>
              <p className="mt-1">{formatDate(result.rentalEndDate)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

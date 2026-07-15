"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  whatsAppSettingsSchema,
  type WhatsAppSettingsInput,
} from "@/lib/validations/whatsapp-settings";

export function WhatsAppSettingsForm({
  initialSettings,
  isConfigured,
}: {
  initialSettings: WhatsAppSettingsInput;
  isConfigured: boolean;
}) {
  const form = useForm<WhatsAppSettingsInput>({
    resolver: zodResolver(whatsAppSettingsSchema),
    defaultValues: initialSettings,
  });

  const mutation = useMutation({
    mutationFn: async (values: WhatsAppSettingsInput) => {
      const res = await fetch("/api/admin/whatsapp/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.settings as WhatsAppSettingsInput;
    },
    onSuccess: (settings) => {
      toast.success("WhatsApp settings saved");
      form.reset(settings);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div
        className={
          isConfigured
            ? "flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            : "flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        }
      >
        {isConfigured ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0" />
        )}
        <div className="text-sm">
          {isConfigured ? (
            <p>Brevo API key is configured. WhatsApp messages can be sent.</p>
          ) : (
            <p>
              <span className="font-medium">BREVO_API_KEY</span> is not set. Add it as an
              environment variable (e.g. in Vercel) to enable sending — everything else here will
              still save normally.
            </p>
          )}
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-6"
        >
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg">Enable WhatsApp Notifications</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Master switch for all automatic WhatsApp sending.
                </p>
              </div>
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="senderLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Sender Number</FormLabel>
                    <FormControl>
                      <Input placeholder="919876543210" {...field} />
                    </FormControl>
                    <FormDescription>
                      The WhatsApp Business number registered and approved in your Brevo account.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-lg">Automatic Sending</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which events automatically trigger a WhatsApp message (using the active
              template for that event).
            </p>

            <div className="mt-4 space-y-4">
              {(
                [
                  ["autoSendOnBookingConfirmed", "Booking Confirmed"],
                  ["autoSendOnBookingReturned", "Booking Returned"],
                  ["autoSendOnBookingCancelled", "Booking Cancelled"],
                  ["autoSendOnInvoiceSent", "Invoice Sent"],
                  ["autoSendOnPaymentReceived", "Payment Received"],
                  ["autoSendOnCustomisationBillSent", "Customisation Bill Sent"],
                  ["autoSendOnSaleBillSent", "Sale Bill Sent"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-normal">{label}</FormLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/connect";
import { Settings } from "@/models/Settings";
import { WhatsAppTemplate } from "@/models/WhatsAppTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppSettingsForm } from "@/components/admin/whatsapp-settings-form";
import { WhatsAppTemplatesClient } from "@/components/admin/whatsapp-templates-client";
import { WhatsAppLogList } from "@/components/admin/whatsapp-log-list";
import { WhatsAppTestDialog } from "@/components/admin/whatsapp-test-dialog";
import { isWhatsAppConfigured } from "@/lib/notifications/brevo-whatsapp";
import { DEFAULT_WHATSAPP_SETTINGS, type WhatsAppSettingsInput } from "@/lib/validations/whatsapp-settings";

export const metadata: Metadata = { title: "WhatsApp" };

export default async function AdminWhatsAppPage() {
  await connectToDatabase();

  const [settingsDoc, templates] = await Promise.all([
    Settings.findOne({ module: "whatsapp" }).lean(),
    WhatsAppTemplate.find().sort({ triggerEvent: 1, createdAt: -1 }).lean(),
  ]);

  const settings = (settingsDoc?.data as WhatsAppSettingsInput) ?? DEFAULT_WHATSAPP_SETTINGS;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order updates, notifications, and message templates via Brevo.
          </p>
        </div>
        <WhatsAppTestDialog />
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="log">Message Log</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <WhatsAppSettingsForm initialSettings={settings} isConfigured={isWhatsAppConfigured()} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <WhatsAppTemplatesClient
            initialTemplates={templates.map((template) => ({
              _id: String(template._id),
              name: template.name,
              triggerEvent: template.triggerEvent,
              brevoTemplateId: template.brevoTemplateId,
              previewBody: template.previewBody,
              isActive: template.isActive,
            }))}
          />
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <WhatsAppLogList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

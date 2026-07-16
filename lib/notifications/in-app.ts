import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Notification, type NotificationType } from "@/models/Notification";
import { User, type UserRole } from "@/models/User";

interface NotifyAccountsPayload {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/** Fire-and-forget in-app notification fan-out; must never break the calling request. */
export async function notifyAccounts(roles: UserRole[], payload: NotifyAccountsPayload): Promise<void> {
  try {
    await connectToDatabase();

    const recipients = await User.find({ role: { $in: roles }, isActive: true }, "_id").lean();
    if (recipients.length === 0) return;

    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient: recipient._id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        relatedEntityType: payload.relatedEntityType,
        relatedEntityId: payload.relatedEntityId,
      }))
    );
  } catch {
    // Notifications must never break the calling request/route.
  }
}

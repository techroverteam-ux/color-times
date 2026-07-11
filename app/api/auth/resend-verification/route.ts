import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/notifications/verification-email";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(): Promise<Response> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return apiError("Authentication required", 401);
  }

  await connectToDatabase();

  const user = await User.findById(currentUser.sub).select("email name isEmailVerified");
  if (!user) {
    return apiError("Account not found", 404);
  }

  if (user.isEmailVerified) {
    return apiSuccess({ alreadyVerified: true });
  }

  void sendVerificationEmail(user._id.toString(), user.email, user.name);

  return apiSuccess({ sent: true });
}

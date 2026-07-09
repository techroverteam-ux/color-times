import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";

const SUPER_ADMIN_NAME = "TechRover Admin";
const SUPER_ADMIN_EMAIL = "admin@techrover.com";
const SUPER_ADMIN_PASSWORD = "Techrover@2026";

async function main() {
  await connectToDatabase();

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);

  const user = await User.findOneAndUpdate(
    { email: SUPER_ADMIN_EMAIL },
    {
      $set: {
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        role: "super_admin",
        isEmailVerified: true,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Super admin ready: ${user.email} (role: ${user.role}, id: ${user._id})`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed super admin:", error);
  process.exit(1);
});

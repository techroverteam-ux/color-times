import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { hashPassword } from "@/lib/auth/password";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

interface ImportRow {
  name?: string;
  email?: string;
  phone?: string;
  fatherName?: string;
  addressLine1?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
}

interface ImportResult {
  row: number;
  name: string;
  status: "created" | "skipped";
  reason?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return apiError("No rows to import", 400);
    }
    if (rows.length > 500) {
      return apiError("Import is limited to 500 rows at a time", 400);
    }

    await connectToDatabase();

    const results: ImportResult[] = [];
    const createdIds: string[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNumber = i + 2; // account for header row
      const name = row.name?.trim();
      const email = row.email?.trim().toLowerCase();

      if (!name) {
        results.push({ row: rowNumber, name: "(unnamed)", status: "skipped", reason: "Missing name" });
        continue;
      }
      if (!email || !EMAIL_PATTERN.test(email)) {
        results.push({ row: rowNumber, name, status: "skipped", reason: "Missing or invalid email" });
        continue;
      }

      const existing = await User.findOne({ email }).lean();
      if (existing) {
        results.push({ row: rowNumber, name, status: "skipped", reason: "Email already exists" });
        continue;
      }

      const addresses =
        row.addressLine1?.trim() &&
        row.addressCity?.trim() &&
        row.addressState?.trim() &&
        row.addressPostalCode?.trim()
          ? [
              {
                label: "Primary",
                line1: row.addressLine1.trim(),
                city: row.addressCity.trim(),
                state: row.addressState.trim(),
                postalCode: row.addressPostalCode.trim(),
                isDefault: true,
              },
            ]
          : [];

      const temporaryPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(temporaryPassword);

      const customer = await User.create({
        name,
        email,
        phone: row.phone?.trim() || undefined,
        fatherName: row.fatherName?.trim() || undefined,
        passwordHash,
        role: "customer",
        isEmailVerified: true,
        isActive: true,
        addresses,
      });

      createdIds.push(String(customer._id));
      results.push({ row: rowNumber, name, status: "created" });
    }

    if (createdIds.length > 0) {
      await recordAuditLog({
        entityType: "User",
        entityId: "bulk",
        action: "import",
        actor: auth.user,
        metadata: { count: createdIds.length, ids: createdIds, role: "customer" },
      });
    }

    return apiSuccess({
      results,
      createdCount: results.filter((r) => r.status === "created").length,
      skippedCount: results.filter((r) => r.status === "skipped").length,
    });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

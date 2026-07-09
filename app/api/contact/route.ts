import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { ContactMessage } from "@/models/ContactMessage";
import { contactSchema } from "@/lib/validations/contact";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const input = contactSchema.parse(body);

    await connectToDatabase();
    const message = await ContactMessage.create(input);

    return apiSuccess({ id: message._id.toString() }, 201);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

import { NextResponse } from "next/server";
import { emailService } from "@/lib/email/sendgrid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, emiList, ccEmails } = body;

    if (!userEmail || !emiList || !Array.isArray(emiList)) {
      return NextResponse.json(
        { detail: "userEmail and a valid emiList array are required" },
        { status: 400 }
      );
    }

    const success = await emailService.sendBulkEmiReminders(
      userEmail,
      userName || "User",
      emiList,
      ccEmails
    );

    if (success) {
      return NextResponse.json({ message: "Bulk reminders sent successfully" });
    } else {
      return NextResponse.json(
        { detail: "Failed to send bulk reminders" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Failed to send bulk reminders" },
      { status: 500 }
    );
  }
}

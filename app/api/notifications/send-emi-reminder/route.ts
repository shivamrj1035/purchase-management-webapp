import { NextResponse } from "next/server";
import { emailService } from "@/lib/email/sendgrid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, emiDetails, ccEmails } = body;

    if (!userEmail || !emiDetails) {
      return NextResponse.json(
        { detail: "userEmail and emiDetails are required" },
        { status: 400 }
      );
    }

    const success = await emailService.sendEmiReminder(
      userEmail,
      userName || "User",
      emiDetails,
      ccEmails
    );

    if (success) {
      return NextResponse.json({ message: "Reminder sent successfully" });
    } else {
      return NextResponse.json(
        { detail: "Failed to send reminder" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Failed to send reminder" },
      { status: 500 }
    );
  }
}

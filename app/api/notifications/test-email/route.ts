import { NextResponse } from "next/server";
import { emailService } from "@/lib/email/sendgrid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName } = body;

    if (!userEmail) {
      return NextResponse.json(
        { detail: "userEmail is required" },
        { status: 400 }
      );
    }

    const success = await emailService.sendTestEmail(
      userEmail,
      userName || "User"
    );

    if (success) {
      return NextResponse.json({ message: "Test email sent successfully" });
    } else {
      return NextResponse.json(
        { detail: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

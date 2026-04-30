import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

export interface EMIPaymentDetails {
  funding_source_name: string;
  month_number: number;
  amount: number;
  due_date: string | Date;
  status?: string;
}

export class EmailService {
  private useSendGrid: boolean;
  private smtpHost = "smtp.gmail.com";
  private smtpPort = 587;
  private senderEmail: string;
  private senderPassword?: string;
  private fromName: string;

  constructor() {
    const sgApiKey = process.env.SENDGRID_API_KEY;
    if (sgApiKey) {
      sgMail.setApiKey(sgApiKey);
      this.useSendGrid = true;
    } else {
      this.useSendGrid = false;
      console.warn("⚠️ SendGrid not installed or no API key provided. Using Gmail SMTP (may not work on some hosting platforms)");
    }

    this.senderEmail = process.env.GMAIL_EMAIL || process.env.FROM_EMAIL || "";
    this.senderPassword = process.env.GMAIL_APP_PASSWORD;
    this.fromName = process.env.FROM_NAME || "Housing Management System";
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    htmlContent: string,
    ccEmails?: string[]
  ): Promise<boolean> {
    if (this.useSendGrid) {
      return this.sendViaSendGrid(toEmail, subject, htmlContent, ccEmails);
    } else {
      return this.sendViaSmtp(toEmail, subject, htmlContent, ccEmails);
    }
  }

  private async sendViaSendGrid(
    toEmail: string,
    subject: string,
    htmlContent: string,
    ccEmails?: string[]
  ): Promise<boolean> {
    try {
      console.log(`📧 Sending email via SendGrid to ${toEmail}...`);
      const msg: sgMail.MailDataRequired = {
        to: toEmail,
        from: {
          email: this.senderEmail,
          name: this.fromName,
        },
        subject,
        html: htmlContent,
      };

      if (ccEmails && ccEmails.length > 0) {
        msg.cc = ccEmails;
      }

      await sgMail.send(msg);
      console.log(`✅ Email sent successfully via SendGrid`);
      return true;
    } catch (error: any) {
      console.error(`❌ SendGrid error:`, error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error(`SendGrid email failed: ${error.message}`);
    }
  }

  private async sendViaSmtp(
    toEmail: string,
    subject: string,
    htmlContent: string,
    ccEmails?: string[]
  ): Promise<boolean> {
    if (!this.senderEmail || !this.senderPassword) {
      throw new Error(
        "Email service not configured. Set SENDGRID_API_KEY and FROM_EMAIL in .env, or GMAIL_EMAIL and GMAIL_APP_PASSWORD."
      );
    }

    try {
      console.log(`📧 Connecting to ${this.smtpHost}:${this.smtpPort}...`);
      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: false,
        auth: {
          user: this.senderEmail,
          pass: this.senderPassword,
        },
      });

      const mailOptions: any = {
        from: `"${this.fromName}" <${this.senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      };

      if (ccEmails && ccEmails.length > 0) {
        mailOptions.cc = ccEmails.join(", ");
      }

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${toEmail}`);
      return true;
    } catch (error: any) {
      console.error(`❌ SMTP error:`, error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendTestEmail(toEmail: string, userName: string): Promise<boolean> {
    const subject = "Housing Management System - Test Email";
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
            .footer { background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 Property Purchase Management</h1>
            <p>Email Configuration Test</p>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            <p>This is a test email to confirm that your email configuration is working correctly.</p>
            <p>If you are receiving this, your settings are properly configured and you will be able to receive EMI payment reminders.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from your Property Purchase Management System</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;

    return this.sendEmail(toEmail, subject, htmlContent);
  }

  async sendEmiReminder(
    toEmail: string,
    userName: string,
    emiDetails: EMIPaymentDetails,
    ccEmails?: string[]
  ): Promise<boolean> {
    const subject = `🔔 EMI Payment Reminder - ${emiDetails.funding_source_name}`;

    const amountStr = `₹${emiDetails.amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const dueDateObj = new Date(emiDetails.due_date);
    const now = new Date();
    const daysUntil = Math.ceil(
      (dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const urgencyColor =
      daysUntil <= 3 ? "#dc2626" : daysUntil <= 7 ? "#f59e0b" : "#3b82f6";
    const urgencyText =
      daysUntil <= 3 ? "URGENT - " : daysUntil <= 7 ? "Due Soon - " : "";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
            .alert-box { background: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; }
            .details-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .label { color: #64748b; font-weight: 500; }
            .value { color: #0f172a; font-weight: 600; }
            .footer { background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 Property Purchase Management</h1>
            <p>EMI Payment Reminder</p>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            <p>This is a friendly reminder about your upcoming EMI payment.</p>
            <div class="alert-box">${urgencyText}${daysUntil} days until payment due</div>
            <div class="details-card">
                <h3 style="margin-top: 0; color: #0f172a;">Payment Details</h3>
                <div class="detail-row"><span class="label">Funding Source:</span><span class="value">${
                  emiDetails.funding_source_name
                }</span></div>
                <div class="detail-row"><span class="label">EMI Month:</span><span class="value">Month ${
                  emiDetails.month_number
                }</span></div>
                <div class="detail-row"><span class="label">Amount Due:</span><span class="value" style="color: #3b82f6; font-size: 20px;">${amountStr}</span></div>
                <div class="detail-row"><span class="label">Due Date:</span><span class="value">${dueDateObj.toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                )}</span></div>
                <div class="detail-row"><span class="label">Status:</span><span class="value" style="color: ${urgencyColor};">${(
      emiDetails.status || "Pending"
    ).toUpperCase()}</span></div>
            </div>
            <p style="margin-top: 30px;"><strong>Please ensure timely payment to avoid any late fees or penalties.</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated reminder from your Property Purchase Management System</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;

    return this.sendEmail(toEmail, subject, htmlContent, ccEmails);
  }

  async sendBulkEmiReminders(
    toEmail: string,
    userName: string,
    emiList: EMIPaymentDetails[],
    ccEmails?: string[]
  ): Promise<boolean> {
    const subject = `🔔 ${emiList.length} Upcoming EMI Payment${
      emiList.length > 1 ? "s" : ""
    } - Action Required`;

    let emiRows = "";
    let totalAmount = 0;

    for (const emi of emiList) {
      totalAmount += emi.amount;
      const dueDateObj = new Date(emi.due_date);
      const now = new Date();
      const daysUntil = Math.ceil(
        (dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let urgencyBadge = "";
      if (daysUntil <= 3) {
        urgencyBadge =
          '<span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">URGENT</span>';
      } else if (daysUntil <= 7) {
        urgencyBadge =
          '<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">DUE SOON</span>';
      }

      emiRows += `
      <div class="detail-row">
          <div>
              <strong>${emi.funding_source_name}</strong><br>
              <small style="color: #64748b;">Month ${
                emi.month_number
              } • Due: ${dueDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}</small>
          </div>
          <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 600; color: #0f172a;">₹${emi.amount.toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</div>
              ${urgencyBadge}
          </div>
      </div>
      `;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
            .details-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0; align-items: center; }
            .detail-row:last-child { border-bottom: none; }
            .total-row { background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }
            .footer { background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 Property Purchase Management</h1>
            <p>Multiple EMI Payments Due</p>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            <p>You have <strong>${
              emiList.length
            }</strong> upcoming EMI payment${
      emiList.length > 1 ? "s" : ""
    } that require your attention.</p>
            <div class="details-card">
                <h3 style="margin-top: 0; color: #0f172a;">Payment Summary</h3>
                ${emiRows}
                <div class="total-row">
                    <strong style="font-size: 16px; color: #0f172a;">Total Amount Due:</strong>
                    <strong style="font-size: 22px; color: #3b82f6;">₹${totalAmount.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</strong>
                </div>
            </div>
            <p style="margin-top: 30px;"><strong>⚠️ Please ensure timely payments to avoid late fees or penalties.</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated reminder from your Property Purchase Management System</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;

    return this.sendEmail(toEmail, subject, htmlContent, ccEmails);
  }
}

export const emailService = new EmailService();

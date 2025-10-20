"""
Email Service for sending notifications using SendGrid or Gmail SMTP
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Any
import os
from datetime import datetime

try:
    from sendgrid import SendGridAPIClient  # type: ignore[import-untyped]
    from sendgrid.helpers.mail import Mail, Email, To, Content  # type: ignore[import-untyped]
    SENDGRID_AVAILABLE = True
except ImportError:
    # Define placeholder types to avoid type-checking errors
    SendGridAPIClient = None  # type: ignore[misc,assignment]
    Mail = None  # type: ignore[misc,assignment]
    Email = None  # type: ignore[misc,assignment]
    To = None  # type: ignore[misc,assignment]
    Content = None  # type: ignore[misc,assignment]
    SENDGRID_AVAILABLE = False
    print("⚠️ SendGrid not installed. Using Gmail SMTP (may not work on some hosting platforms)")
    print("💡 Install SendGrid with: pip install sendgrid")

class EmailService:
    """Email Service with SendGrid (primary) and Gmail SMTP (fallback)"""
    
    def __init__(self):
        # SendGrid configuration (preferred for production)
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.use_sendgrid = SENDGRID_AVAILABLE and bool(self.sendgrid_api_key)
        
        # Gmail SMTP configuration (fallback for local development)
        self.smtp_host = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("GMAIL_EMAIL") or os.getenv("FROM_EMAIL")
        self.sender_password = os.getenv("GMAIL_APP_PASSWORD")
        self.from_name = os.getenv("FROM_NAME", "Housing Management System")
        
        # Determine which service to use
        if self.use_sendgrid:
            print("✅ SendGrid configured - Using SendGrid API for email delivery")
            print(f"📧 Sender: {self.sender_email}")
        elif self.sender_email and self.sender_password:
            print("⚠️ Using Gmail SMTP (may not work on some hosting platforms like Render free tier)")
            print(f"📧 Sender: {self.sender_email}")
        else:
            print("⚠️ WARNING: No email service configured")
            print("💡 Option 1 (Recommended): Set SENDGRID_API_KEY and FROM_EMAIL in .env")
            print("💡 Option 2: Set GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env")
            print("📧 Email notifications will not work until configured.")
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send email using SendGrid API or Gmail SMTP
        
        Args:
            to_email: Primary recipient email
            subject: Email subject
            html_content: HTML email body
            cc_emails: List of CC email addresses
            
        Returns:
            bool: True if email sent successfully
        """
        if self.use_sendgrid:
            return self._send_via_sendgrid(to_email, subject, html_content, cc_emails)
        else:
            return self._send_via_smtp(to_email, subject, html_content, cc_emails)
    
    def _send_via_sendgrid(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send email using SendGrid API
        """
        try:
            print(f"📧 Sending email via SendGrid to {to_email}...")
            
            # Create SendGrid message
            message = Mail(  # type: ignore[misc]
                from_email=Email(self.sender_email, self.from_name),  # type: ignore[misc]
                to_emails=To(to_email),  # type: ignore[misc]
                subject=subject,
                html_content=Content("text/html", html_content)  # type: ignore[misc]
            )
            
            # Add CC recipients if provided
            if cc_emails:
                for cc_email in cc_emails:
                    message.add_cc(Email(cc_email))  # type: ignore[misc]
            
            # Send email
            sg = SendGridAPIClient(self.sendgrid_api_key)  # type: ignore[misc]
            response = sg.send(message)
            
            print(f"✅ Email sent successfully via SendGrid (Status: {response.status_code})")
            if cc_emails:
                print(f"📋 CC sent to: {', '.join(cc_emails)}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ SendGrid error: {error_msg}")
            
            # Provide helpful error messages
            if "401" in error_msg or "Unauthorized" in error_msg:
                raise ValueError("SendGrid API key is invalid. Please check SENDGRID_API_KEY in .env file")
            elif "403" in error_msg or "Forbidden" in error_msg:
                raise ValueError("SendGrid account issue. Please verify your SendGrid account is active")
            else:
                raise ValueError(f"SendGrid email failed: {error_msg}")
    
    def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send email using Gmail SMTP (fallback method)
        """
        # Check credentials before attempting to send
        if not self.sender_email or not self.sender_password:
            raise ValueError(
                "Email service not configured. "
                "Option 1: Set SENDGRID_API_KEY and FROM_EMAIL in .env (recommended for production). "
                "Option 2: Set GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env (local development only)"
            )
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.sender_email}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            if cc_emails:
                message["Cc"] = ", ".join(cc_emails)
            
            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Prepare recipient list
            recipients = [to_email]
            if cc_emails:
                recipients.extend(cc_emails)
            
            # Connect to Gmail SMTP server with timeout
            print(f"📧 Connecting to {self.smtp_host}:{self.smtp_port}...")
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                server.starttls()  # Upgrade to secure connection
                print(f"🔐 Logging in as {self.sender_email}...")
                server.login(self.sender_email, self.sender_password)
                print(f"📤 Sending email to {to_email}...")
                server.sendmail(self.sender_email, recipients, message.as_string())
            
            print(f"✅ Email sent successfully to {to_email}")
            if cc_emails:
                print(f"📋 CC sent to: {', '.join(cc_emails)}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"❌ Gmail authentication failed: {str(e)}")
            print("💡 Make sure you're using an App Password, not your regular Gmail password")
            print("📖 See: https://myaccount.google.com/apppasswords")
            raise ValueError("Gmail authentication failed. Please check your GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env file. Make sure you're using an App Password, not your regular password.")
        except (smtplib.SMTPException, OSError, ConnectionError) as e:
            error_msg = str(e)
            print(f"❌ SMTP error: {error_msg}")
            
            # Check if it's a network issue (common on Render free tier)
            if "Network is unreachable" in error_msg or "[Errno 101]" in error_msg:
                raise ValueError(
                    "SMTP connection blocked by hosting provider. "
                    "Gmail SMTP doesn't work on Render free tier. "
                    "Please use SendGrid instead: Set SENDGRID_API_KEY and FROM_EMAIL in environment variables."
                )
            else:
                raise ValueError(f"Email sending failed: {error_msg}")
        except Exception as e:
            print(f"❌ Error sending email: {str(e)}")
            raise ValueError(f"Unexpected error sending email: {str(e)}")
    
    def send_emi_reminder(
        self,
        to_email: str,
        user_name: str,
        emi_details: dict,
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send EMI payment reminder email
        
        Args:
            to_email: User's email
            user_name: User's name
            emi_details: EMI payment details dict
            cc_emails: List of CC emails from notification config
            
        Returns:
            bool: Success status
        """
        subject = f"🔔 EMI Payment Reminder - {emi_details['funding_source_name']}"
        
        # Format currency
        amount = f"₹{emi_details['amount']:,.2f}"
        due_date = emi_details['due_date']
        
        # Calculate days until due (handle both string and datetime, and timezone issues)
        if isinstance(due_date, str):
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        else:
            due_date_obj = due_date
        
        # Remove timezone info to avoid offset-naive/offset-aware comparison issues
        if due_date_obj.tzinfo is not None:
            due_date_obj = due_date_obj.replace(tzinfo=None)
        
        now = datetime.now()
        days_until = (due_date_obj - now).days
        
        urgency_color = "#dc2626" if days_until <= 3 else "#f59e0b" if days_until <= 7 else "#3b82f6"
        urgency_text = "URGENT - " if days_until <= 3 else "Due Soon - " if days_until <= 7 else ""
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border-left: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                }}
                .alert-box {{
                    background: {urgency_color};
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: bold;
                    font-size: 18px;
                }}
                .details-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    margin: 20px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #e2e8f0;
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .label {{
                    color: #64748b;
                    font-weight: 500;
                }}
                .value {{
                    color: #0f172a;
                    font-weight: 600;
                }}
                .footer {{
                    background: #1e293b;
                    color: #94a3b8;
                    padding: 20px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    font-size: 12px;
                }}
                .cta-button {{
                    background: #3b82f6;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: 600;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Property Purchase Management</h1>
                <p>EMI Payment Reminder</p>
            </div>
            
            <div class="content">
                <h2>Hello {user_name},</h2>
                <p>This is a friendly reminder about your upcoming EMI payment.</p>
                
                <div class="alert-box">
                    {urgency_text}{days_until} days until payment due
                </div>
                
                <div class="details-card">
                    <h3 style="margin-top: 0; color: #0f172a;">Payment Details</h3>
                    
                    <div class="detail-row">
                        <span class="label">Funding Source:</span>
                        <span class="value">{emi_details['funding_source_name']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">EMI Month:</span>
                        <span class="value">Month {emi_details['month_number']}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Amount Due:</span>
                        <span class="value" style="color: #3b82f6; font-size: 20px;">{amount}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Due Date:</span>
                        <span class="value">{due_date_obj.strftime('%B %d, %Y')}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="label">Status:</span>
                        <span class="value" style="color: {urgency_color};">{emi_details.get('status', 'Pending').upper()}</span>
                    </div>
                </div>
                
                <p style="margin-top: 30px;">
                    <strong>Please ensure timely payment to avoid any late fees or penalties.</strong>
                </p>
                
                <p style="color: #64748b; font-size: 14px;">
                    💡 <em>Tip: Set up auto-debit to never miss a payment!</em>
                </p>
            </div>
            
            <div class="footer">
                <p>This is an automated reminder from your Property Purchase Management System</p>
                <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                <p style="margin-top: 15px;">
                    © 2025 Property Purchase Management System. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content, cc_emails)
    
    def send_bulk_emi_reminders(
        self,
        to_email: str,
        user_name: str,
        emi_list: List[dict],
        cc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send bulk EMI reminders in a single email
        
        Args:
            to_email: User's email
            user_name: User's name
            emi_list: List of EMI payment details
            cc_emails: CC email addresses
            
        Returns:
            bool: Success status
        """
        subject = f"🔔 {len(emi_list)} Upcoming EMI Payment{'s' if len(emi_list) > 1 else ''} - Action Required"
        
        # Generate EMI rows
        emi_rows = ""
        total_amount = 0
        
        for emi in emi_list:
            amount = emi['amount']
            total_amount += amount
            
            # Handle datetime conversion and timezone issues
            due_date = emi['due_date']
            if isinstance(due_date, str):
                due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            else:
                due_date_obj = due_date
            
            # Remove timezone info to avoid offset-naive/offset-aware comparison issues
            if due_date_obj.tzinfo is not None:
                due_date_obj = due_date_obj.replace(tzinfo=None)
            
            now = datetime.now()
            days_until = (due_date_obj - now).days
            
            urgency_badge = ""
            if days_until <= 3:
                urgency_badge = '<span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">URGENT</span>'
            elif days_until <= 7:
                urgency_badge = '<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">DUE SOON</span>'
            
            emi_rows += f"""
            <div class="detail-row">
                <div>
                    <strong>{emi['funding_source_name']}</strong><br>
                    <small style="color: #64748b;">Month {emi['month_number']} • Due: {due_date_obj.strftime('%b %d, %Y')}</small>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 600; color: #0f172a;">₹{amount:,.2f}</div>
                    {urgency_badge}
                </div>
            </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border-left: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                }}
                .details-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    margin: 20px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    border-bottom: 1px solid #e2e8f0;
                    align-items: center;
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .total-row {{
                    background: #f1f5f9;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }}
                .footer {{
                    background: #1e293b;
                    color: #94a3b8;
                    padding: 20px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Property Purchase Management</h1>
                <p>Multiple EMI Payments Due</p>
            </div>
            
            <div class="content">
                <h2>Hello {user_name},</h2>
                <p>You have <strong>{len(emi_list)}</strong> upcoming EMI payment{'s' if len(emi_list) > 1 else ''} that require your attention.</p>
                
                <div class="details-card">
                    <h3 style="margin-top: 0; color: #0f172a;">Payment Summary</h3>
                    {emi_rows}
                    
                    <div class="total-row">
                        <strong style="font-size: 16px; color: #0f172a;">Total Amount Due:</strong>
                        <strong style="font-size: 22px; color: #3b82f6;">₹{total_amount:,.2f}</strong>
                    </div>
                </div>
                
                <p style="margin-top: 30px;">
                    <strong>⚠️ Please ensure timely payments to avoid late fees or penalties.</strong>
                </p>
            </div>
            
            <div class="footer">
                <p>This is an automated reminder from your Property Purchase Management System</p>
                <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content, cc_emails)

# Singleton instance
email_service = EmailService()

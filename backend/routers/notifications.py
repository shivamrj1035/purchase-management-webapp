"""
Notifications Router
Handles notification configuration and email triggers
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email_service import email_service
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Request Models
class NotificationConfig(BaseModel):
    """Notification configuration settings"""
    userId: str
    primaryEmail: EmailStr
    ccEmails: List[EmailStr] = []
    enableAutoReminders: bool = True
    reminderDaysBefore: int = 7  # Send reminder X days before due date

class EMINotificationRequest(BaseModel):
    """Request to send EMI notification"""
    userId: str
    userName: str
    userEmail: EmailStr
    emiPayments: List[dict]  # List of EMI payment details
    ccEmails: List[EmailStr] = []

class SingleEMINotificationRequest(BaseModel):
    """Request to send single EMI notification"""
    userId: str
    userName: str
    userEmail: EmailStr
    emiDetails: dict
    ccEmails: List[EmailStr] = []

class BulkNotificationRequest(BaseModel):
    """Request to send bulk notifications"""
    userId: str
    userName: str
    userEmail: EmailStr
    emiList: List[dict]
    ccEmails: List[EmailStr] = []

class TestEmailRequest(BaseModel):
    """Request to send test email"""
    userEmail: EmailStr
    userName: str = "Test User"

# Response Models
class NotificationResponse(BaseModel):
    """Standard notification response"""
    success: bool
    message: str
    emailsSent: int = 0
    timestamp: str

# Endpoints

@router.post("/send-emi-reminder", response_model=NotificationResponse)
async def send_emi_reminder(request: SingleEMINotificationRequest):
    """
    Send EMI payment reminder email
    
    Args:
        request: Single EMI notification request
        
    Returns:
        NotificationResponse with success status
    """
    try:
        success = email_service.send_emi_reminder(
            to_email=request.userEmail,
            user_name=request.userName,
            emi_details=request.emiDetails,
            cc_emails=request.ccEmails if request.ccEmails else None
        )
        
        if success:
            return NotificationResponse(
                success=True,
                message="EMI reminder sent successfully",
                emailsSent=1,
                timestamp=datetime.now().isoformat()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")

@router.post("/send-bulk-emi-reminders", response_model=NotificationResponse)
async def send_bulk_emi_reminders(request: BulkNotificationRequest):
    """
    Send bulk EMI reminders in a single email
    
    Args:
        request: Bulk notification request with multiple EMIs
        
    Returns:
        NotificationResponse with success status
    """
    try:
        if not request.emiList:
            raise HTTPException(status_code=400, detail="EMI list cannot be empty")
        
        success = email_service.send_bulk_emi_reminders(
            to_email=request.userEmail,
            user_name=request.userName,
            emi_list=request.emiList,
            cc_emails=request.ccEmails if request.ccEmails else None
        )
        
        if success:
            return NotificationResponse(
                success=True,
                message=f"Bulk reminder sent for {len(request.emiList)} EMI payments",
                emailsSent=1,
                timestamp=datetime.now().isoformat()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send bulk email")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending bulk notification: {str(e)}")

@router.post("/test-email", response_model=NotificationResponse)
async def test_email(request: TestEmailRequest):
    """
    Test email configuration by sending a test email
    
    Args:
        request: Test email request with user email and name
        
    Returns:
        NotificationResponse with success status
    """
    try:
        test_emi = {
            "funding_source_name": "Test Bank Loan",
            "month_number": 1,
            "amount": 50000.00,
            "due_date": datetime.now().isoformat(),
            "status": "pending"
        }
        
        success = email_service.send_emi_reminder(
            to_email=request.userEmail,
            user_name=request.userName,
            emi_details=test_emi,
            cc_emails=None
        )
        
        if success:
            return NotificationResponse(
                success=True,
                message="Test email sent successfully",
                emailsSent=1,
                timestamp=datetime.now().isoformat()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}")

@router.get("/health")
async def notification_health():
    """
    Check notification service health
    
    Returns:
        dict: Service health status
    """
    try:
        # Check if email credentials are configured
        if email_service.sender_email and email_service.sender_password:
            return {
                "status": "healthy",
                "service": "Notification Service",
                "email_configured": True,
                "smtp_host": email_service.smtp_host,
                "smtp_port": email_service.smtp_port
            }
        else:
            return {
                "status": "unhealthy",
                "service": "Notification Service",
                "email_configured": False,
                "error": "Email credentials not configured"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "Notification Service",
            "error": str(e)
        }

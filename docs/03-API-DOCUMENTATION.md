# API Documentation - FastAPI Backend

Complete REST API reference for the Housing Management Platform backend.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-api-domain.com`

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Funding Sources](#funding-sources)
4. [Incoming Payments (EMIs)](#incoming-payments)
5. [Outgoing Payments](#outgoing-payments)
6. [Analytics](#analytics)
7. [Reports](#reports)
8. [Settings](#settings)
9. [Email Reminders](#email-reminders)
10. [Error Handling](#error-handling)

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "John Doe",
  "phoneNumber": "+91-9876543210"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "kF8xYz2pLmNqWr5Ts9Vb",
    "email": "user@example.com",
    "username": "John Doe"
  }
}
```

---

### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "expiresIn": 604800,
    "user": {
      "userId": "kF8xYz2pLmNqWr5Ts9Vb",
      "email": "user@example.com",
      "username": "John Doe",
      "isEmailVerified": true
    }
  }
}
```

---

### POST `/api/auth/forgot-password`

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### POST `/api/auth/reset-password`

Reset password with token from email.

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### POST `/api/auth/verify-email`

Verify email address with token.

**Request Body:**

```json
{
  "token": "verification_token_from_email"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST `/api/auth/refresh-token`

Refresh access token.

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "tokenType": "bearer",
    "expiresIn": 604800
  }
}
```

---

## User Management

### GET `/api/users/profile`

Get current user's profile. 🔒 Protected

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "kF8xYz2pLmNqWr5Ts9Vb",
    "email": "user@example.com",
    "username": "John Doe",
    "phoneNumber": "+91-9876543210",
    "homeAddress": "123 Main St, Mumbai",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT `/api/users/profile`

Update user profile. 🔒 Protected

**Request Body:**

```json
{
  "username": "John Updated",
  "phoneNumber": "+91-9999999999",
  "homeAddress": "456 New Street, Mumbai"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "kF8xYz2pLmNqWr5Ts9Vb",
    "email": "user@example.com",
    "username": "John Updated",
    "phoneNumber": "+91-9999999999",
    "homeAddress": "456 New Street, Mumbai",
    "updatedAt": "2024-01-20T14:00:00Z"
  }
}
```

---

## Funding Sources

### GET `/api/funding-sources`

Get all funding sources for the current user. 🔒 Protected

**Query Parameters:**

- `status` (optional): Filter by status ("active", "closed")
- `sourceType` (optional): Filter by type ("bank_loan", "personal_contribution", "organization_loan")
- `sortBy` (optional): Sort field (default: "fundingDate")
- `sortOrder` (optional): "asc" or "desc" (default: "desc")

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "fundingSources": [
      {
        "id": "funding_abc123",
        "sourceType": "bank_loan",
        "lenderName": "HDFC Bank",
        "principalAmount": 5000000,
        "interestRate": 8.5,
        "tenureMonths": 240,
        "emiAmount": 43391,
        "emiPaymentMethod": "auto_debit",
        "fundingDate": "2024-01-10T00:00:00Z",
        "emiStartDate": "2024-02-05T00:00:00Z",
        "status": "active",
        "bankDetails": {
          "bankName": "HDFC Bank",
          "branchName": "Mumbai Central",
          "loanAccountNumber": "12345678901234"
        },
        "totalInterestPayable": 10413840,
        "remainingBalance": 4850000,
        "totalPaid": 130173,
        "remainingEmis": 237
      }
    ],
    "summary": {
      "totalFunding": 5000000,
      "activeFunding": 5000000,
      "closedFunding": 0,
      "totalSources": 1
    }
  }
}
```

---

### GET `/api/funding-sources/{fundingId}`

Get detailed funding source information. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "funding_abc123",
    "sourceType": "bank_loan",
    "lenderName": "HDFC Bank",
    "principalAmount": 5000000,
    "interestRate": 8.5,
    "tenureMonths": 240,
    "emiAmount": 43391,
    "status": "active",
    "amortizationSchedule": [
      {
        "emiNumber": 1,
        "scheduleDate": "2024-02-05",
        "principalAmount": 22724,
        "interestAmount": 20667,
        "totalAmount": 43391,
        "remainingBalance": 4977276,
        "status": "paid",
        "actualPaymentDate": "2024-02-05"
      }
    ],
    "paymentSummary": {
      "totalPaid": 130173,
      "principalPaid": 68172,
      "interestPaid": 62001,
      "remainingEmis": 237
    }
  }
}
```

---

### POST `/api/funding-sources`

Create a new funding source. 🔒 Protected

**Request Body:**

```json
{
  "sourceType": "bank_loan",
  "lenderName": "HDFC Bank",
  "principalAmount": 5000000,
  "interestRate": 8.5,
  "tenureMonths": 240,
  "emiAmount": 43391,
  "emiPaymentMethod": "auto_debit",
  "fundingDate": "2024-01-10",
  "emiStartDate": "2024-02-05",
  "bankDetails": {
    "bankName": "HDFC Bank",
    "branchName": "Mumbai Central",
    "loanAccountNumber": "12345678901234",
    "ifscCode": "HDFC0001234"
  },
  "notes": "Home loan for apartment"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Funding source created successfully",
  "data": {
    "id": "funding_abc123",
    "sourceType": "bank_loan",
    "lenderName": "HDFC Bank",
    "principalAmount": 5000000,
    "status": "active",
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

---

### PUT `/api/funding-sources/{fundingId}`

Update funding source details. 🔒 Protected

**Request Body:**

```json
{
  "lenderName": "HDFC Bank Updated",
  "notes": "Updated notes",
  "status": "active"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Funding source updated successfully",
  "data": {
    "id": "funding_abc123",
    "updatedAt": "2024-01-20T14:00:00Z"
  }
}
```

---

### DELETE `/api/funding-sources/{fundingId}`

Delete a funding source. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Funding source deleted successfully"
}
```

---

## Incoming Payments (EMIs)

### GET `/api/incoming-payments`

Get all EMI payments. 🔒 Protected

**Query Parameters:**

- `fundingSourceId` (optional): Filter by funding source
- `status` (optional): Filter by status ("pending", "paid", "overdue")
- `fromDate` (optional): Filter payments from date
- `toDate` (optional): Filter payments to date

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_xyz789",
        "fundingSourceId": "funding_abc123",
        "lenderName": "HDFC Bank",
        "emiNumber": 3,
        "scheduleDate": "2024-04-05T00:00:00Z",
        "actualPaymentDate": "2024-04-05T14:30:00Z",
        "principalAmount": 22724,
        "interestAmount": 20667,
        "totalAmount": 43391,
        "paymentMethod": "auto_debit",
        "status": "paid",
        "transactionId": "TXN123456789"
      }
    ],
    "summary": {
      "totalPayments": 240,
      "paidCount": 3,
      "pendingCount": 237,
      "overdueCount": 0,
      "totalPaid": 130173,
      "totalPending": 10283667
    }
  }
}
```

---

### GET `/api/incoming-payments/upcoming`

Get upcoming EMI payments (next 30 days). 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "upcomingPayments": [
      {
        "id": "payment_abc456",
        "fundingSourceId": "funding_abc123",
        "lenderName": "HDFC Bank",
        "emiNumber": 4,
        "scheduleDate": "2024-05-05T00:00:00Z",
        "totalAmount": 43391,
        "daysUntilDue": 5,
        "status": "pending"
      }
    ],
    "totalUpcomingAmount": 43391
  }
}
```

---

### POST `/api/incoming-payments/{paymentId}/pay`

Mark an EMI payment as paid. 🔒 Protected

**Request Body:**

```json
{
  "actualPaymentDate": "2024-04-05",
  "paymentMethod": "auto_debit",
  "transactionId": "TXN123456789",
  "notes": "Auto-debited from salary account"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment marked as paid successfully",
  "data": {
    "id": "payment_xyz789",
    "status": "paid",
    "actualPaymentDate": "2024-04-05T14:30:00Z"
  }
}
```

---

### POST `/api/incoming-payments/generate-schedule`

Generate EMI schedule for a funding source. 🔒 Protected

**Request Body:**

```json
{
  "fundingSourceId": "funding_abc123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "EMI schedule generated successfully",
  "data": {
    "scheduleCount": 240,
    "firstEmiDate": "2024-02-05",
    "lastEmiDate": "2044-01-05"
  }
}
```

---

## Outgoing Payments

### GET `/api/outgoing-payments`

Get all outgoing payments. 🔒 Protected

**Query Parameters:**

- `paymentType` (optional): Filter by type
- `status` (optional): Filter by status
- `fromDate` (optional): Filter from date
- `toDate` (optional): Filter to date

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "expense_def456",
        "paymentType": "booking_amount",
        "paymentTo": "ABC Builders Ltd",
        "amount": 500000,
        "paymentDate": "2024-01-10T00:00:00Z",
        "paymentMethod": "bank_transfer",
        "description": "Booking amount for Flat 2B",
        "referenceNumber": "BOOK/2024/001234",
        "status": "completed"
      }
    ],
    "summary": {
      "totalExpenses": 500000,
      "completedExpenses": 500000,
      "pendingExpenses": 0,
      "paymentsByType": {
        "booking_amount": 500000,
        "construction_payment": 0,
        "stamp_duty": 0
      }
    }
  }
}
```

---

### GET `/api/outgoing-payments/{paymentId}`

Get detailed payment information. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "expense_def456",
    "paymentType": "booking_amount",
    "paymentTo": "ABC Builders Ltd",
    "amount": 500000,
    "paymentDate": "2024-01-10T00:00:00Z",
    "paymentMethod": "bank_transfer",
    "description": "Booking amount for Flat 2B, Tower A",
    "referenceNumber": "BOOK/2024/001234",
    "documents": ["https://storage.googleapis.com/.../booking_receipt.pdf"],
    "category": "Initial Payments",
    "status": "completed",
    "notes": "Received allotment letter",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
}
```

---

### POST `/api/outgoing-payments`

Create a new outgoing payment. 🔒 Protected

**Request Body:**

```json
{
  "paymentType": "booking_amount",
  "paymentTo": "ABC Builders Ltd",
  "amount": 500000,
  "paymentDate": "2024-01-10",
  "paymentMethod": "bank_transfer",
  "description": "Booking amount for Flat 2B",
  "referenceNumber": "BOOK/2024/001234",
  "category": "Initial Payments",
  "status": "completed"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "expense_def456",
    "paymentType": "booking_amount",
    "amount": 500000,
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

---

### PUT `/api/outgoing-payments/{paymentId}`

Update outgoing payment. 🔒 Protected

**Request Body:**

```json
{
  "status": "completed",
  "notes": "Payment completed successfully"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment updated successfully"
}
```

---

### DELETE `/api/outgoing-payments/{paymentId}`

Delete an outgoing payment. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

---

## Analytics

### GET `/api/analytics/dashboard`

Get complete dashboard analytics. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "fundingSummary": {
      "totalFunded": 5000000,
      "activeFunding": 5000000,
      "fundingSourcesCount": 1
    },
    "expensesSummary": {
      "totalExpenses": 500000,
      "completedExpenses": 500000,
      "pendingExpenses": 0,
      "expensesCount": 1
    },
    "financialOverview": {
      "netPosition": 4500000,
      "totalInterestPaid": 62001,
      "principalPaid": 68172,
      "remainingEmis": 237,
      "nextPaymentDue": {
        "date": "2024-05-05",
        "amount": 43391,
        "daysUntil": 5
      }
    }
  }
}
```

---

### GET `/api/analytics/interest-breakdown`

Get interest analysis. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalInterestPaid": 62001,
    "totalInterestPayable": 10413840,
    "interestByLender": [
      {
        "lenderName": "HDFC Bank",
        "principalAmount": 5000000,
        "interestPaid": 62001,
        "interestPayable": 10413840,
        "interestRate": 8.5
      }
    ],
    "principalVsInterest": {
      "totalPrincipal": 68172,
      "totalInterest": 62001,
      "ratio": 0.52
    }
  }
}
```

---

### GET `/api/analytics/loan-wise-summary`

Get loan-wise breakdown. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "fundingId": "funding_abc123",
        "lenderName": "HDFC Bank",
        "principalAmount": 5000000,
        "interestRate": 8.5,
        "totalInterestPayable": 10413840,
        "paymentsMade": 3,
        "remainingEmis": 237,
        "totalPaid": 130173,
        "status": "active"
      }
    ]
  }
}
```

---

### GET `/api/analytics/payment-timeline`

Get payment timeline data. 🔒 Protected

**Query Parameters:**

- `fromDate` (optional): Start date
- `toDate` (optional): End date

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "date": "2024-01-10",
        "fundingReceived": 5000000,
        "expensesPaid": 500000,
        "netCashflow": 4500000
      },
      {
        "date": "2024-02-05",
        "fundingReceived": 0,
        "expensesPaid": 43391,
        "netCashflow": -43391
      }
    ]
  }
}
```

---

## Reports

### GET `/api/reports/financial-summary`

Generate financial summary report. 🔒 Protected

**Query Parameters:**

- `fromDate` (required): Start date
- `toDate` (required): End date
- `format` (optional): "json", "csv", "pdf" (default: "json")

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reportPeriod": {
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31"
    },
    "fundingSummary": {
      "totalFunded": 5000000,
      "fundingSourcesCount": 1
    },
    "expensesSummary": {
      "totalExpenses": 500000,
      "expensesCount": 1
    },
    "loanSummary": {
      "totalInterestPaid": 62001,
      "totalPrincipalPaid": 68172,
      "emisPaid": 3
    },
    "netPosition": 4500000
  }
}
```

---

### GET `/api/reports/payment-history`

Generate payment history report. 🔒 Protected

**Query Parameters:**

- `fromDate` (required)
- `toDate` (required)
- `type` (optional): "incoming", "outgoing", "all" (default: "all")
- `format` (optional): "json", "csv", "pdf"

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "incomingPayments": [],
    "outgoingPayments": [],
    "summary": {
      "totalIncoming": 130173,
      "totalOutgoing": 500000,
      "netOutflow": 369827
    }
  }
}
```

---

## Settings

### GET `/api/settings/reminders`

Get reminder settings. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "preDueDateDays": 3,
    "reminderFrequency": "once",
    "recipients": ["user@example.com"],
    "paymentTypes": ["builder_payment", "registration"],
    "emiReminders": true,
    "expenseReminders": true
  }
}
```

---

### PUT `/api/settings/reminders`

Update reminder settings. 🔒 Protected

**Request Body:**

```json
{
  "enabled": true,
  "preDueDateDays": 5,
  "reminderFrequency": "weekly",
  "recipients": ["user@example.com", "spouse@example.com"],
  "emiReminders": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Reminder settings updated successfully"
}
```

---

### GET `/api/settings/preferences`

Get user preferences. 🔒 Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currency": "INR",
    "currencySymbol": "₹",
    "timezone": "Asia/Kolkata",
    "dateFormat": "DD/MM/YYYY",
    "language": "en",
    "theme": "dark"
  }
}
```

---

### PUT `/api/settings/preferences`

Update user preferences. 🔒 Protected

**Request Body:**

```json
{
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "dateFormat": "MM/DD/YYYY"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Preferences updated successfully"
}
```

---

## Email Reminders

### POST `/api/reminders/test-email`

Send test reminder email. 🔒 Protected

**Request Body:**

```json
{
  "recipientEmail": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

---

### GET `/api/reminders/schedule`

Get scheduled reminders. 🔒 Protected (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "nextRun": "2024-05-01T06:00:00Z",
    "upcomingReminders": [
      {
        "userId": "kF8xYz2pLmNqWr5Ts9Vb",
        "paymentType": "emi",
        "dueDate": "2024-05-05",
        "amount": 43391
      }
    ]
  }
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Status Code | Error Code              | Description                     |
| ----------- | ----------------------- | ------------------------------- |
| 400         | `VALIDATION_ERROR`      | Request validation failed       |
| 401         | `UNAUTHORIZED`          | Authentication required         |
| 401         | `INVALID_TOKEN`         | JWT token is invalid or expired |
| 403         | `FORBIDDEN`             | Insufficient permissions        |
| 404         | `NOT_FOUND`             | Resource not found              |
| 409         | `CONFLICT`              | Resource already exists         |
| 422         | `UNPROCESSABLE_ENTITY`  | Validation error                |
| 429         | `RATE_LIMIT_EXCEEDED`   | Too many requests               |
| 500         | `INTERNAL_SERVER_ERROR` | Server error                    |
| 503         | `SERVICE_UNAVAILABLE`   | Service temporarily unavailable |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

---

## Pagination

For list endpoints, use these query parameters:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

**Next:** [Frontend Guide](./04-FRONTEND-GUIDE.md)

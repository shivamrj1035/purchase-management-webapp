# Database Schema - Firestore Data Model

Complete documentation of the Firestore database structure for the Housing Management Platform.

## Overview

The database uses Firestore's NoSQL document-based structure with the following top-level collections:

- `users` - User profiles and all related data

All user-specific data is nested under each user's document for better organization and security.

---

## Database Structure

```
firestore/
└── users/
    └── {userId}/
        ├── profile (document fields)
        ├── fundingSources/ (subcollection)
        ├── incomingPayments/ (subcollection)
        ├── outgoingPayments/ (subcollection)
        └── settings/ (subcollection)
```

---

## Collection: `users`

### Document ID

- Format: Auto-generated Firebase UID
- Example: `kF8xYz2pLmNqWr5Ts9Vb`

### Root Document Fields (Profile Data)

| Field             | Type      | Required | Description                   |
| ----------------- | --------- | -------- | ----------------------------- |
| `email`           | string    | Yes      | User's email address (unique) |
| `username`        | string    | Yes      | Display name                  |
| `phoneNumber`     | string    | No       | Contact phone number          |
| `homeAddress`     | string    | No       | Home/property address         |
| `createdAt`       | timestamp | Yes      | Account creation timestamp    |
| `updatedAt`       | timestamp | Yes      | Last profile update timestamp |
| `isEmailVerified` | boolean   | Yes      | Email verification status     |

**Example:**

```json
{
  "email": "john.doe@example.com",
  "username": "John Doe",
  "phoneNumber": "+91-9876543210",
  "homeAddress": "123 Main Street, Mumbai, MH 400001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "isEmailVerified": true
}
```

---

## Subcollection: `fundingSources`

Tracks all sources of funding (loans, personal contributions, etc.)

### Document ID

- Format: Auto-generated
- Example: `funding_abc123xyz`

### Fields

| Field              | Type      | Required | Description                                               |
| ------------------ | --------- | -------- | --------------------------------------------------------- |
| `sourceType`       | string    | Yes      | "bank_loan", "personal_contribution", "organization_loan" |
| `lenderName`       | string    | Yes      | Name of lender (e.g., "HDFC Bank", "Friend - John")       |
| `principalAmount`  | number    | Yes      | Original loan/contribution amount                         |
| `interestRate`     | number    | Yes      | Annual interest rate percentage (0 for interest-free)     |
| `tenureMonths`     | number    | Yes      | Total duration in months                                  |
| `emiAmount`        | number    | Yes      | Monthly EMI amount (0 for lump sum)                       |
| `emiPaymentMethod` | string    | No       | "bank_transfer", "check", "cash", "auto_debit"            |
| `fundingDate`      | timestamp | Yes      | Date when funds were received                             |
| `emiStartDate`     | timestamp | No       | Date of first EMI (if applicable)                         |
| `status`           | string    | Yes      | "active", "closed"                                        |
| `bankDetails`      | object    | No       | Bank-specific information (see below)                     |
| `documents`        | array     | No       | Array of document URLs                                    |
| `notes`            | string    | No       | Additional notes                                          |
| `createdAt`        | timestamp | Yes      | Document creation timestamp                               |
| `updatedAt`        | timestamp | Yes      | Last update timestamp                                     |

### Nested Object: `bankDetails`

| Field               | Type   | Required | Description         |
| ------------------- | ------ | -------- | ------------------- |
| `bankName`          | string | No       | Name of the bank    |
| `branchName`        | string | No       | Branch location     |
| `loanAccountNumber` | string | No       | Loan account number |
| `ifscCode`          | string | No       | Bank IFSC code      |

**Example:**

```json
{
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
    "loanAccountNumber": "12345678901234",
    "ifscCode": "HDFC0001234"
  },
  "documents": [
    "https://storage.googleapis.com/.../loan_agreement.pdf",
    "https://storage.googleapis.com/.../sanction_letter.pdf"
  ],
  "notes": "Home loan for apartment in Mumbai",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

---

## Subcollection: `incomingPayments`

Tracks EMI payments FROM user TO funding sources (your debt payments)

### Document ID

- Format: Auto-generated
- Example: `payment_xyz789abc`

### Fields

| Field               | Type      | Required | Description                                    |
| ------------------- | --------- | -------- | ---------------------------------------------- |
| `fundingSourceId`   | string    | Yes      | Reference to funding source document ID        |
| `emiNumber`         | number    | Yes      | Sequential EMI number (1, 2, 3...)             |
| `scheduleDate`      | timestamp | Yes      | When EMI was due                               |
| `actualPaymentDate` | timestamp | No       | When EMI was actually paid (null if pending)   |
| `principalAmount`   | number    | Yes      | Principal component of EMI                     |
| `interestAmount`    | number    | Yes      | Interest component of EMI                      |
| `totalAmount`       | number    | Yes      | Total EMI amount (principal + interest)        |
| `paymentMethod`     | string    | No       | "bank_transfer", "check", "cash", "auto_debit" |
| `status`            | string    | Yes      | "pending", "paid", "overdue"                   |
| `transactionId`     | string    | No       | Bank transaction/reference ID                  |
| `receiptUrl`        | string    | No       | URL to payment receipt/proof                   |
| `notes`             | string    | No       | Additional notes                               |
| `createdAt`         | timestamp | Yes      | Document creation timestamp                    |
| `updatedAt`         | timestamp | Yes      | Last update timestamp                          |

**Example:**

```json
{
  "fundingSourceId": "funding_abc123xyz",
  "emiNumber": 3,
  "scheduleDate": "2024-04-05T00:00:00Z",
  "actualPaymentDate": "2024-04-05T14:30:00Z",
  "principalAmount": 22724,
  "interestAmount": 20667,
  "totalAmount": 43391,
  "paymentMethod": "auto_debit",
  "status": "paid",
  "transactionId": "TXN123456789",
  "receiptUrl": "https://storage.googleapis.com/.../receipt_emi3.pdf",
  "notes": "Auto-debited from salary account",
  "createdAt": "2024-03-01T00:00:00Z",
  "updatedAt": "2024-04-05T14:30:00Z"
}
```

---

## Subcollection: `outgoingPayments`

Tracks payments FROM user TO builders, authorities, and service providers

### Document ID

- Format: Auto-generated
- Example: `expense_def456ghi`

### Fields

| Field             | Type      | Required | Description                                                |
| ----------------- | --------- | -------- | ---------------------------------------------------------- |
| `paymentType`     | string    | Yes      | See payment types below                                    |
| `paymentTo`       | string    | Yes      | Recipient name (e.g., "ABC Builders", "Stamp Duty Office") |
| `amount`          | number    | Yes      | Payment amount                                             |
| `paymentDate`     | timestamp | Yes      | Date of payment                                            |
| `paymentMethod`   | string    | Yes      | "bank_transfer", "check", "cash", "card"                   |
| `description`     | string    | No       | Detailed description                                       |
| `referenceNumber` | string    | No       | Invoice/booking/receipt reference number                   |
| `documents`       | array     | No       | Array of document URLs (receipts, invoices)                |
| `category`        | string    | No       | Custom category for grouping                               |
| `status`          | string    | Yes      | "pending", "completed"                                     |
| `notes`           | string    | No       | Additional notes                                           |
| `createdAt`       | timestamp | Yes      | Document creation timestamp                                |
| `updatedAt`       | timestamp | Yes      | Last update timestamp                                      |

### Payment Types (enum)

- `builder_payment` - Payments to property builder
- `booking_amount` - Initial booking fee
- `down_payment` - Down payment
- `construction_payment` - Construction phase payments
- `registration` - Property registration fees
- `valuation` - Property valuation charges
- `document_fee` - Documentation fees
- `stamp_duty` - Stamp duty charges
- `legal` - Legal fees
- `interior` - Interior/furnishing costs
- `other` - Other miscellaneous payments

**Example:**

```json
{
  "paymentType": "booking_amount",
  "paymentTo": "ABC Builders Ltd",
  "amount": 500000,
  "paymentDate": "2024-01-10T00:00:00Z",
  "paymentMethod": "bank_transfer",
  "description": "Booking amount for Flat 2B, Tower A",
  "referenceNumber": "BOOK/2024/001234",
  "documents": [
    "https://storage.googleapis.com/.../booking_receipt.pdf",
    "https://storage.googleapis.com/.../allotment_letter.pdf"
  ],
  "category": "Initial Payments",
  "status": "completed",
  "notes": "Received allotment letter after payment",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

---

## Subcollection: `settings`

User preferences and configuration

### Document: `settings/reminders`

Email reminder configuration

| Field               | Type      | Required | Description                                  |
| ------------------- | --------- | -------- | -------------------------------------------- |
| `enabled`           | boolean   | Yes      | Master toggle for all reminders              |
| `preDueDateDays`    | number    | Yes      | Days before due date to send reminder (1-30) |
| `reminderFrequency` | string    | Yes      | "once", "weekly", "daily"                    |
| `recipients`        | array     | Yes      | Array of email addresses to notify           |
| `paymentTypes`      | array     | Yes      | Which payment types to remind for            |
| `emiReminders`      | boolean   | Yes      | Enable EMI reminders                         |
| `expenseReminders`  | boolean   | Yes      | Enable outgoing payment reminders            |
| `updatedAt`         | timestamp | Yes      | Last update timestamp                        |

**Example:**

```json
{
  "enabled": true,
  "preDueDateDays": 3,
  "reminderFrequency": "once",
  "recipients": ["john.doe@example.com", "jane.doe@example.com"],
  "paymentTypes": ["builder_payment", "registration", "stamp_duty"],
  "emiReminders": true,
  "expenseReminders": true,
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Document: `settings/preferences`

General user preferences

| Field            | Type      | Required | Description                                |
| ---------------- | --------- | -------- | ------------------------------------------ |
| `currency`       | string    | Yes      | Currency code (e.g., "INR", "USD")         |
| `currencySymbol` | string    | Yes      | Currency symbol (e.g., "₹", "$")           |
| `timezone`       | string    | Yes      | User timezone (e.g., "Asia/Kolkata")       |
| `dateFormat`     | string    | Yes      | Preferred date format (e.g., "DD/MM/YYYY") |
| `language`       | string    | Yes      | Preferred language (e.g., "en")            |
| `theme`          | string    | Yes      | "dark" (forced dark theme)                 |
| `updatedAt`      | timestamp | Yes      | Last update timestamp                      |

**Example:**

```json
{
  "currency": "INR",
  "currencySymbol": "₹",
  "timezone": "Asia/Kolkata",
  "dateFormat": "DD/MM/YYYY",
  "language": "en",
  "theme": "dark",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## Indexes

For optimal query performance, create these composite indexes in Firestore:

### Index 1: Funding Sources by Status and Date

```
Collection: users/{userId}/fundingSources
Fields: status (Ascending), fundingDate (Descending)
```

### Index 2: Incoming Payments by Status and Date

```
Collection: users/{userId}/incomingPayments
Fields: status (Ascending), scheduleDate (Ascending)
```

### Index 3: Incoming Payments by Funding Source

```
Collection: users/{userId}/incomingPayments
Fields: fundingSourceId (Ascending), emiNumber (Ascending)
```

### Index 4: Outgoing Payments by Type and Date

```
Collection: users/{userId}/outgoingPayments
Fields: paymentType (Ascending), paymentDate (Descending)
```

### Index 5: Outgoing Payments by Status and Date

```
Collection: users/{userId}/outgoingPayments
Fields: status (Ascending), paymentDate (Ascending)
```

---

## Security Rules

Basic Firestore security rules (to be enhanced based on requirements):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Allow read/write only to the document owner
      allow read, write: if isOwner(userId);

      // Funding sources subcollection
      match /fundingSources/{fundingId} {
        allow read, write: if isOwner(userId);
      }

      // Incoming payments subcollection
      match /incomingPayments/{paymentId} {
        allow read, write: if isOwner(userId);
      }

      // Outgoing payments subcollection
      match /outgoingPayments/{expenseId} {
        allow read, write: if isOwner(userId);
      }

      // Settings subcollection
      match /settings/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## Data Validation Rules

### General Rules

- All monetary amounts must be non-negative numbers
- Dates must be valid timestamps
- Email addresses must be properly formatted
- Status fields must match defined enums
- Required fields cannot be null or empty

### Specific Validations

**Funding Sources:**

- `interestRate` must be between 0 and 30
- `tenureMonths` must be between 1 and 360
- `emiAmount` must be greater than 0 if tenure > 0
- `principalAmount` must be greater than 0

**Incoming Payments:**

- `totalAmount` must equal `principalAmount + interestAmount`
- `emiNumber` must be between 1 and tenure
- `actualPaymentDate` must be after `scheduleDate` if status is "paid"
- Status "overdue" only if current date > scheduleDate and status != "paid"

**Outgoing Payments:**

- `amount` must be greater than 0
- `paymentDate` cannot be in the future
- `paymentType` must be from defined enum

---

## Calculated/Derived Fields

These fields are calculated on-the-fly and not stored:

### For Funding Sources:

- **Total Interest Payable**: `(emiAmount × tenureMonths) - principalAmount`
- **Remaining Balance**: `principalAmount - sum(paid principalAmount from incomingPayments)`
- **Remaining EMIs**: `tenureMonths - count(paid incomingPayments)`
- **Total Paid**: `sum(totalAmount from paid incomingPayments)`

### For Dashboard:

- **Total Funded**: `sum(principalAmount from all fundingSources)`
- **Total Payments**: `sum(amount from all outgoingPayments)`
- **Net Position**: `Total Funded - Total Payments`
- **Total Interest Paid**: `sum(interestAmount from paid incomingPayments)`

---

## Sample Data Creation Scripts

### Creating a Sample Funding Source:

```javascript
const fundingSource = {
  sourceType: "bank_loan",
  lenderName: "HDFC Bank",
  principalAmount: 5000000,
  interestRate: 8.5,
  tenureMonths: 240,
  emiAmount: 43391,
  emiPaymentMethod: "auto_debit",
  fundingDate: new Date("2024-01-10"),
  emiStartDate: new Date("2024-02-05"),
  status: "active",
  bankDetails: {
    bankName: "HDFC Bank",
    branchName: "Mumbai Central",
    loanAccountNumber: "12345678901234",
    ifscCode: "HDFC0001234",
  },
  documents: [],
  notes: "Home loan for apartment",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## Migration Considerations

If migrating from another system:

1. Ensure all dates are converted to Firestore timestamps
2. Validate all enum values match the schema
3. Calculate and populate EMI schedules for existing loans
4. Verify referential integrity (fundingSourceId references)
5. Set up proper indexes before large data imports

---

**Next:** [API Documentation](./03-API-DOCUMENTATION.md)

# API Schema Reference

Complete reference for all data models and API schemas used in the Housing Management Platform.

## TypeScript Types (Frontend)

### Authentication Types

```typescript
// lib/types/auth.ts

export interface User {
  userId: string;
  email: string;
  username: string;
  phoneNumber?: string;
  homeAddress?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
```

### Funding Source Types

```typescript
// lib/types/funding.ts

export type SourceType =
  | "bank_loan"
  | "personal_contribution"
  | "organization_loan";
export type PaymentMethod = "bank_transfer" | "check" | "cash" | "auto_debit";
export type FundingStatus = "active" | "closed";

export interface BankDetails {
  bankName: string;
  branchName: string;
  loanAccountNumber: string;
  ifscCode?: string;
}

export interface FundingSource {
  id: string;
  sourceType: SourceType;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  emiPaymentMethod?: PaymentMethod;
  fundingDate: Date;
  emiStartDate?: Date;
  status: FundingStatus;
  bankDetails?: BankDetails;
  documents?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFundingSourceRequest {
  sourceType: SourceType;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  emiPaymentMethod?: PaymentMethod;
  fundingDate: string;
  emiStartDate?: string;
  bankDetails?: BankDetails;
  notes?: string;
}

export interface FundingSourceWithCalculations extends FundingSource {
  totalInterestPayable: number;
  remainingBalance: number;
  totalPaid: number;
  remainingEmis: number;
}

export interface AmortizationScheduleEntry {
  emiNumber: number;
  scheduleDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
  status: "pending" | "paid" | "overdue";
  actualPaymentDate?: Date;
}
```

### Payment Types

```typescript
// lib/types/payment.ts

export type PaymentStatus = "pending" | "paid" | "overdue" | "completed";

export interface IncomingPayment {
  id: string;
  fundingSourceId: string;
  lenderName: string;
  emiNumber: number;
  scheduleDate: Date;
  actualPaymentDate?: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkPaymentAsPaid {
  actualPaymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export type OutgoingPaymentType =
  | "builder_payment"
  | "booking_amount"
  | "down_payment"
  | "construction_payment"
  | "registration"
  | "valuation"
  | "document_fee"
  | "stamp_duty"
  | "legal"
  | "interior"
  | "other";

export interface OutgoingPayment {
  id: string;
  paymentType: OutgoingPaymentType;
  paymentTo: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  description?: string;
  referenceNumber?: string;
  documents?: string[];
  category?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutgoingPaymentRequest {
  paymentType: OutgoingPaymentType;
  paymentTo: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  description?: string;
  referenceNumber?: string;
  category?: string;
  status?: PaymentStatus;
  notes?: string;
}
```

### Analytics Types

```typescript
// lib/types/analytics.ts

export interface DashboardSummary {
  fundingSummary: {
    totalFunded: number;
    activeFunding: number;
    fundingSourcesCount: number;
  };
  expensesSummary: {
    totalExpenses: number;
    completedExpenses: number;
    pendingExpenses: number;
    expensesCount: number;
  };
  financialOverview: {
    netPosition: number;
    totalInterestPaid: number;
    principalPaid: number;
    remainingEmis: number;
    nextPaymentDue?: {
      date: Date;
      amount: number;
      daysUntil: number;
    };
  };
}

export interface InterestBreakdown {
  totalInterestPaid: number;
  totalInterestPayable: number;
  interestByLender: Array<{
    lenderName: string;
    principalAmount: number;
    interestPaid: number;
    interestPayable: number;
    interestRate: number;
  }>;
  principalVsInterest: {
    totalPrincipal: number;
    totalInterest: number;
    ratio: number;
  };
}

export interface LoanSummary {
  fundingId: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  totalInterestPayable: number;
  paymentsMade: number;
  remainingEmis: number;
  totalPaid: number;
  status: FundingStatus;
}

export interface PaymentTimelineData {
  date: Date;
  fundingReceived: number;
  expensesPaid: number;
  netCashflow: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}
```

### Settings Types

```typescript
// lib/types/settings.ts

export type ReminderFrequency = "once" | "weekly" | "daily";

export interface ReminderSettings {
  enabled: boolean;
  preDueDateDays: number;
  reminderFrequency: ReminderFrequency;
  recipients: string[];
  paymentTypes: OutgoingPaymentType[];
  emiReminders: boolean;
  expenseReminders: boolean;
  updatedAt: Date;
}

export interface UserPreferences {
  currency: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  language: string;
  theme: "dark" | "light";
  updatedAt: Date;
}

export interface UpdateReminderSettingsRequest {
  enabled?: boolean;
  preDueDateDays?: number;
  reminderFrequency?: ReminderFrequency;
  recipients?: string[];
  emiReminders?: boolean;
  expenseReminders?: boolean;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  language?: string;
}
```

### Common Types

```typescript
// lib/types/common.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface FilterOptions {
  status?: string;
  sourceType?: string;
  paymentType?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

---

## Python Models (Backend)

### User Models

```python
# backend/models/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, max_length=100)
    phone_number: Optional[str] = None
    home_address: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=2, max_length=100)
    phone_number: Optional[str] = None
    home_address: Optional[str] = None

class UserInDB(UserBase):
    user_id: str
    is_email_verified: bool = False
    created_at: datetime
    updated_at: datetime

class UserResponse(UserInDB):
    pass

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
```

### Funding Models

```python
# backend/models/funding.py
from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class SourceType(str, Enum):
    BANK_LOAN = "bank_loan"
    PERSONAL_CONTRIBUTION = "personal_contribution"
    ORGANIZATION_LOAN = "organization_loan"

class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"
    CASH = "cash"
    AUTO_DEBIT = "auto_debit"

class FundingStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"

class BankDetails(BaseModel):
    bank_name: str
    branch_name: str
    loan_account_number: str
    ifsc_code: Optional[str] = None

class FundingSourceBase(BaseModel):
    source_type: SourceType
    lender_name: str = Field(..., min_length=1, max_length=200)
    principal_amount: float = Field(..., gt=0)
    interest_rate: float = Field(..., ge=0, le=30)
    tenure_months: int = Field(..., gt=0, le=360)
    emi_amount: float = Field(..., gt=0)
    emi_payment_method: Optional[PaymentMethod] = None
    funding_date: date
    emi_start_date: Optional[date] = None
    bank_details: Optional[BankDetails] = None
    notes: Optional[str] = None

    @validator('emi_start_date')
    def emi_start_after_funding(cls, v, values):
        if v and 'funding_date' in values and v < values['funding_date']:
            raise ValueError('EMI start date must be after funding date')
        return v

class FundingSourceCreate(FundingSourceBase):
    pass

class FundingSourceUpdate(BaseModel):
    lender_name: Optional[str] = Field(None, min_length=1, max_length=200)
    emi_payment_method: Optional[PaymentMethod] = None
    status: Optional[FundingStatus] = None
    notes: Optional[str] = None

class FundingSourceInDB(FundingSourceBase):
    id: str
    status: FundingStatus = FundingStatus.ACTIVE
    documents: List[str] = []
    created_at: datetime
    updated_at: datetime

class FundingSourceResponse(FundingSourceInDB):
    total_interest_payable: float
    remaining_balance: float
    total_paid: float
    remaining_emis: int

class AmortizationEntry(BaseModel):
    emi_number: int
    schedule_date: date
    principal_amount: float
    interest_amount: float
    total_amount: float
    remaining_balance: float
    status: str
    actual_payment_date: Optional[date] = None
```

### Payment Models

```python
# backend/models/payment.py
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    COMPLETED = "completed"

class IncomingPaymentBase(BaseModel):
    funding_source_id: str
    emi_number: int = Field(..., gt=0)
    schedule_date: date
    principal_amount: float = Field(..., gt=0)
    interest_amount: float = Field(..., ge=0)
    total_amount: float = Field(..., gt=0)

class MarkPaymentAsPaid(BaseModel):
    actual_payment_date: date
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class IncomingPaymentInDB(IncomingPaymentBase):
    id: str
    actual_payment_date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class IncomingPaymentResponse(IncomingPaymentInDB):
    lender_name: str

class OutgoingPaymentType(str, Enum):
    BUILDER_PAYMENT = "builder_payment"
    BOOKING_AMOUNT = "booking_amount"
    DOWN_PAYMENT = "down_payment"
    CONSTRUCTION_PAYMENT = "construction_payment"
    REGISTRATION = "registration"
    VALUATION = "valuation"
    DOCUMENT_FEE = "document_fee"
    STAMP_DUTY = "stamp_duty"
    LEGAL = "legal"
    INTERIOR = "interior"
    OTHER = "other"

class OutgoingPaymentBase(BaseModel):
    payment_type: OutgoingPaymentType
    payment_to: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    payment_date: date
    payment_method: PaymentMethod
    description: Optional[str] = None
    reference_number: Optional[str] = None
    category: Optional[str] = None

class OutgoingPaymentCreate(OutgoingPaymentBase):
    status: PaymentStatus = PaymentStatus.COMPLETED
    notes: Optional[str] = None

class OutgoingPaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    notes: Optional[str] = None

class OutgoingPaymentInDB(OutgoingPaymentBase):
    id: str
    documents: List[str] = []
    status: PaymentStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class OutgoingPaymentResponse(OutgoingPaymentInDB):
    pass
```

### Analytics Models

```python
# backend/models/analytics.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class FundingSummary(BaseModel):
    total_funded: float
    active_funding: float
    funding_sources_count: int

class ExpensesSummary(BaseModel):
    total_expenses: float
    completed_expenses: float
    pending_expenses: float
    expenses_count: int

class NextPayment(BaseModel):
    date: date
    amount: float
    days_until: int

class FinancialOverview(BaseModel):
    net_position: float
    total_interest_paid: float
    principal_paid: float
    remaining_emis: int
    next_payment_due: Optional[NextPayment] = None

class DashboardSummary(BaseModel):
    funding_summary: FundingSummary
    expenses_summary: ExpensesSummary
    financial_overview: FinancialOverview

class InterestByLender(BaseModel):
    lender_name: str
    principal_amount: float
    interest_paid: float
    interest_payable: float
    interest_rate: float

class PrincipalVsInterest(BaseModel):
    total_principal: float
    total_interest: float
    ratio: float

class InterestBreakdown(BaseModel):
    total_interest_paid: float
    total_interest_payable: float
    interest_by_lender: List[InterestByLender]
    principal_vs_interest: PrincipalVsInterest

class LoanSummary(BaseModel):
    funding_id: str
    lender_name: str
    principal_amount: float
    interest_rate: float
    total_interest_payable: float
    payments_made: int
    remaining_emis: int
    total_paid: float
    status: str
```

### Settings Models

```python
# backend/models/settings.py
from pydantic import BaseModel, EmailStr, Field
from typing import List
from datetime import datetime
from enum import Enum

class ReminderFrequency(str, Enum):
    ONCE = "once"
    WEEKLY = "weekly"
    DAILY = "daily"

class ReminderSettings(BaseModel):
    enabled: bool = True
    pre_due_date_days: int = Field(..., ge=1, le=30)
    reminder_frequency: ReminderFrequency
    recipients: List[EmailStr]
    payment_types: List[str] = []
    emi_reminders: bool = True
    expense_reminders: bool = True
    updated_at: datetime

class UpdateReminderSettings(BaseModel):
    enabled: Optional[bool] = None
    pre_due_date_days: Optional[int] = Field(None, ge=1, le=30)
    reminder_frequency: Optional[ReminderFrequency] = None
    recipients: Optional[List[EmailStr]] = None
    emi_reminders: Optional[bool] = None
    expense_reminders: Optional[bool] = None

class UserPreferences(BaseModel):
    currency: str = "INR"
    currency_symbol: str = "₹"
    timezone: str = "Asia/Kolkata"
    date_format: str = "DD/MM/YYYY"
    language: str = "en"
    theme: str = "dark"
    updated_at: datetime

class UpdatePreferences(BaseModel):
    currency: Optional[str] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    language: Optional[str] = None
```

### Common Models

```python
# backend/models/common.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Generic, TypeVar

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None
    error: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class PaginationMeta(BaseModel):
    current_page: int
    total_pages: int
    total_items: int
    items_per_page: int
    has_next: bool
    has_previous: bool

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    pagination: PaginationMeta
```

---

## Firestore Document Structure

### User Document

```
users/{userId}
├── email: string
├── username: string
├── phoneNumber: string
├── homeAddress: string
├── isEmailVerified: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Funding Source Document

```
users/{userId}/fundingSources/{fundingId}
├── sourceType: string
├── lenderName: string
├── principalAmount: number
├── interestRate: number
├── tenureMonths: number
├── emiAmount: number
├── emiPaymentMethod: string
├── fundingDate: timestamp
├── emiStartDate: timestamp
├── status: string
├── bankDetails: map
│   ├── bankName: string
│   ├── branchName: string
│   ├── loanAccountNumber: string
│   └── ifscCode: string
├── documents: array
├── notes: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Payment Document

```
users/{userId}/incomingPayments/{paymentId}
├── fundingSourceId: string
├── emiNumber: number
├── scheduleDate: timestamp
├── actualPaymentDate: timestamp
├── principalAmount: number
├── interestAmount: number
├── totalAmount: number
├── paymentMethod: string
├── status: string
├── transactionId: string
├── receiptUrl: string
├── notes: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

---

This schema reference provides complete type definitions for both frontend and backend development!

# Complete Project Structure

This document provides a detailed overview of the entire project structure.

## Directory Tree

```
housing-management/
│
├── README.md                           # Main project documentation
├── PROJECT-STRUCTURE.md                # This file
├── .gitignore                          # Git ignore rules
│
├── docs/                               # Documentation folder
│   ├── 01-SETUP-GUIDE.md              # Setup instructions
│   ├── 02-DATABASE-SCHEMA.md          # Database structure
│   ├── 03-API-DOCUMENTATION.md        # API reference
│   ├── 04-FRONTEND-GUIDE.md           # Frontend development guide
│   ├── 05-DEPLOYMENT.md               # Deployment instructions
│   └── 06-FEATURES.md                 # Feature documentation
│
├── frontend/                           # Next.js frontend application
│   ├── app/                           # Next.js 14 app directory
│   │   ├── (auth)/                    # Auth route group (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # Registration page
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx          # Password reset page
│   │   │   └── layout.tsx            # Auth layout
│   │   │
│   │   ├── (dashboard)/               # Dashboard route group (protected)
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Main dashboard page
│   │   │   │
│   │   │   ├── funding-sources/      # Funding sources section
│   │   │   │   ├── page.tsx          # List all funding sources
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Individual funding source detail
│   │   │   │   └── components/
│   │   │   │       ├── FundingSourceTable.tsx
│   │   │   │       ├── FundingSourceCard.tsx
│   │   │   │       ├── AddFundingSourceModal.tsx
│   │   │   │       ├── EditFundingSourceModal.tsx
│   │   │   │       ├── AmortizationSchedule.tsx
│   │   │   │       ├── InterestChart.tsx
│   │   │   │       └── FundingSourceFilters.tsx
│   │   │   │
│   │   │   ├── incoming-payments/    # EMI payments section
│   │   │   │   ├── page.tsx          # All EMI payments
│   │   │   │   ├── upcoming/
│   │   │   │   │   └── page.tsx      # Upcoming EMIs
│   │   │   │   └── components/
│   │   │   │       ├── PaymentCard.tsx
│   │   │   │       ├── MarkAsPaidModal.tsx
│   │   │   │       ├── PaymentHistoryTable.tsx
│   │   │   │       └── UpcomingPaymentAlert.tsx
│   │   │   │
│   │   │   ├── outgoing-payments/    # Outgoing payments section
│   │   │   │   ├── page.tsx          # List all payments
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Payment detail
│   │   │   │   └── components/
│   │   │   │       ├── OutgoingPaymentTable.tsx
│   │   │   │       ├── AddPaymentModal.tsx
│   │   │   │       ├── PaymentTypeFilter.tsx
│   │   │   │       └── PaymentSummaryCards.tsx
│   │   │   │
│   │   │   ├── analytics/            # Analytics section
│   │   │   │   ├── page.tsx          # Main analytics dashboard
│   │   │   │   ├── interest-breakdown/
│   │   │   │   │   └── page.tsx      # Interest analysis
│   │   │   │   ├── loan-wise/
│   │   │   │   │   └── page.tsx      # Loan comparison
│   │   │   │   ├── payment-timeline/
│   │   │   │   │   └── page.tsx      # Timeline visualization
│   │   │   │   └── components/
│   │   │   │       ├── InterestAnalysisChart.tsx
│   │   │   │       ├── LoanComparisonTable.tsx
│   │   │   │       ├── PaymentTimelineChart.tsx
│   │   │   │       ├── BankWiseSummary.tsx
│   │   │   │       └── PaymentMethodChart.tsx
│   │   │   │
│   │   │   ├── reports/              # Reports section
│   │   │   │   ├── page.tsx          # Reports dashboard
│   │   │   │   └── components/
│   │   │   │       ├── FinancialSummaryReport.tsx
│   │   │   │       ├── PaymentHistoryReport.tsx
│   │   │   │       ├── TaxReport.tsx
│   │   │   │       ├── UpcomingObligationsReport.tsx
│   │   │   │       └── ReportExporter.tsx
│   │   │   │
│   │   │   └── settings/             # Settings section
│   │   │       ├── page.tsx          # Settings page
│   │   │       └── components/
│   │   │           ├── ProfileSettings.tsx
│   │   │           ├── ReminderSettings.tsx
│   │   │           ├── PreferencesSettings.tsx
│   │   │           ├── DataManagement.tsx
│   │   │           └── SecuritySettings.tsx
│   │   │
│   │   ├── api/                      # API routes (if needed)
│   │   │   └── ...
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Global styles
│   │   └── providers.tsx             # Context providers
│   │
│   ├── components/                    # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── form.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── WelcomeBanner.tsx
│   │   │
│   │   └── shared/                   # Shared utility components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── FileUploader.tsx
│   │       ├── DateRangePicker.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── lib/                          # Library code
│   │   ├── firebase/                 # Firebase configuration
│   │   │   ├── config.ts            # Firebase initialization
│   │   │   ├── auth.ts              # Auth helpers
│   │   │   ├── firestore.ts         # Firestore helpers
│   │   │   └── storage.ts           # Storage helpers
│   │   │
│   │   ├── api/                      # API client
│   │   │   ├── client.ts            # Base API client (Axios/Fetch)
│   │   │   ├── auth.ts              # Auth API calls
│   │   │   ├── funding.ts           # Funding API calls
│   │   │   ├── payments.ts          # Payments API calls
│   │   │   ├── analytics.ts         # Analytics API calls
│   │   │   ├── reports.ts           # Reports API calls
│   │   │   └── settings.ts          # Settings API calls
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useFundingSources.ts
│   │   │   ├── useIncomingPayments.ts
│   │   │   ├── useOutgoingPayments.ts
│   │   │   ├── useAnalytics.ts
│   │   │   ├── useSettings.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── store/                    # Zustand state management
│   │   │   ├── authStore.ts         # Auth state
│   │   │   ├── fundingStore.ts      # Funding sources state
│   │   │   ├── paymentStore.ts      # Payments state
│   │   │   └── settingsStore.ts     # Settings state
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.ts        # Number, date, currency formatters
│   │   │   ├── validators.ts        # Validation helpers
│   │   │   ├── calculations.ts      # Financial calculations (EMI, interest)
│   │   │   ├── exporters.ts         # CSV/PDF export utilities
│   │   │   ├── date-utils.ts        # Date manipulation utilities
│   │   │   └── cn.ts                # Class name utility (tailwind)
│   │   │
│   │   └── types/                    # TypeScript type definitions
│   │       ├── auth.ts
│   │       ├── funding.ts
│   │       ├── payment.ts
│   │       ├── analytics.ts
│   │       ├── settings.ts
│   │       └── common.ts
│   │
│   ├── public/                       # Static assets
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── logo-dark.svg
│   │   │   └── placeholder.png
│   │   ├── icons/
│   │   │   ├── favicon.ico
│   │   │   ├── icon-192.png
│   │   │   └── icon-512.png
│   │   └── fonts/
│   │
│   ├── styles/                       # Additional styles
│   │   └── themes/
│   │       └── dark.css
│   │
│   ├── .env.local                    # Environment variables (local)
│   ├── .env.example                  # Example environment variables
│   ├── .eslintrc.json               # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # NPM dependencies
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── components.json              # shadcn/ui configuration
│
└── backend/                          # FastAPI backend application
    ├── api/                          # API routes
    │   ├── __init__.py
    │   ├── auth.py                  # Authentication endpoints
    │   ├── users.py                 # User management endpoints
    │   ├── funding.py               # Funding sources endpoints
    │   ├── payments.py              # Payments endpoints
    │   ├── analytics.py             # Analytics endpoints
    │   ├── reports.py               # Reports endpoints
    │   └── settings.py              # Settings endpoints
    │
    ├── models/                       # Pydantic models
    │   ├── __init__.py
    │   ├── user.py                  # User models
    │   ├── funding.py               # Funding source models
    │   ├── payment.py               # Payment models
    │   ├── analytics.py             # Analytics models
    │   ├── settings.py              # Settings models
    │   └── common.py                # Common models (response, error)
    │
    ├── services/                     # Business logic
    │   ├── __init__.py
    │   ├── auth_service.py          # Authentication logic
    │   ├── user_service.py          # User management logic
    │   ├── funding_service.py       # Funding sources logic
    │   ├── payment_service.py       # Payment processing logic
    │   ├── analytics_service.py     # Analytics calculations
    │   ├── report_service.py        # Report generation
    │   ├── email_service.py         # Email sending
    │   └── reminder_service.py      # Reminder scheduling
    │
    ├── utils/                        # Utility functions
    │   ├── __init__.py
    │   ├── security.py              # Password hashing, JWT
    │   ├── validators.py            # Input validation
    │   ├── firebase_admin.py        # Firebase admin initialization
    │   ├── calculations.py          # Financial calculations
    │   ├── formatters.py            # Data formatters
    │   ├── logger.py                # Logging configuration
    │   └── exceptions.py            # Custom exceptions
    │
    ├── middleware/                   # Custom middleware
    │   ├── __init__.py
    │   ├── auth_middleware.py       # JWT verification
    │   ├── error_handler.py         # Global error handling
    │   └── rate_limiter.py          # Rate limiting
    │
    ├── config/                       # Configuration
    │   ├── __init__.py
    │   └── settings.py              # Application settings (Pydantic BaseSettings)
    │
    ├── tests/                        # Unit tests
    │   ├── __init__.py
    │   ├── test_auth.py
    │   ├── test_funding.py
    │   ├── test_payments.py
    │   └── test_analytics.py
    │
    ├── templates/                    # Email templates
    │   ├── emi_reminder.html
    │   ├── overdue_alert.html
    │   ├── monthly_summary.html
    │   └── payment_confirmation.html
    │
    ├── scripts/                      # Utility scripts
    │   ├── seed_data.py             # Seed database with sample data
    │   ├── migrate_data.py          # Data migration scripts
    │   └── generate_secret_key.py   # Generate secret keys
    │
    ├── .env                         # Environment variables
    ├── .env.example                 # Example environment variables
    ├── .gitignore                   # Git ignore rules
    ├── main.py                      # Application entry point
    ├── requirements.txt             # Python dependencies
    ├── Dockerfile                   # Docker configuration (optional)
    └── render.yaml                  # Render deployment config
```

## Key Files Description

### Frontend

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `app/layout.tsx`            | Root layout with metadata and providers       |
| `app/globals.css`           | Global styles and Tailwind directives         |
| `components/ui/*`           | shadcn/ui components (button, card, etc.)     |
| `lib/firebase/config.ts`    | Firebase initialization                       |
| `lib/api/client.ts`         | API client with authentication                |
| `lib/store/*`               | Zustand state management stores               |
| `lib/utils/calculations.ts` | EMI and interest calculation functions        |
| `next.config.js`            | Next.js configuration (images, headers, etc.) |
| `tailwind.config.js`        | Tailwind CSS theme configuration              |

### Backend

| File                      | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `main.py`                 | FastAPI app initialization and configuration |
| `api/*`                   | API route handlers                           |
| `models/*`                | Pydantic request/response models             |
| `services/*`              | Business logic layer                         |
| `utils/security.py`       | JWT token handling and password hashing      |
| `utils/firebase_admin.py` | Firebase Admin SDK initialization            |
| `config/settings.py`      | Environment variables and app configuration  |
| `requirements.txt`        | Python package dependencies                  |

---

## Technology Stack Summary

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **API Client**: Axios or Fetch

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Validation**: Pydantic
- **Authentication**: JWT (python-jose)
- **Email**: SendGrid
- **Scheduling**: APScheduler
- **Testing**: pytest

### Database & Services

- **Database**: Cloud Firestore (Firebase)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Email Service**: SendGrid
- **Deployment**: Vercel (Frontend) + Render (Backend)

---

## Development Workflow

1. **Frontend Development**: `cd frontend && npm run dev`
2. **Backend Development**: `cd backend && uvicorn main:app --reload`
3. **Run Tests**:
   - Frontend: `npm test`
   - Backend: `pytest`
4. **Build Production**:
   - Frontend: `npm run build`
   - Backend: Deployed automatically to Render
5. **Deploy**: Push to GitHub main branch (auto-deploy enabled)

---

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=
```

### Backend (.env)

```
APP_NAME=
DEBUG=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
FIREBASE_CREDENTIALS_PATH=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=
ALLOWED_ORIGINS=
```

---

This structure provides a scalable, maintainable architecture for the Housing Management Platform!

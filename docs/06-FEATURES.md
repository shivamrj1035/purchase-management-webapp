# Features Documentation

Detailed documentation of all features in the Housing Management Platform.

## Table of Contents

1. [Dashboard](#dashboard)
2. [Funding Sources Management](#funding-sources-management)
3. [EMI Payment Tracking](#emi-payment-tracking)
4. [Outgoing Payments Management](#outgoing-payments-management)
5. [Analytics & Insights](#analytics--insights)
6. [Reports & Export](#reports--export)
7. [Settings & Configuration](#settings--configuration)
8. [Email Reminders](#email-reminders)

---

## Dashboard

### Overview

The main dashboard provides a comprehensive view of the user's financial status with three key summary cards and quick actions.

### Summary Cards

#### 1. Total Funding Summary Card

**Purpose:** Display total amount received from all funding sources.

**Displays:**

- Total funded amount (₹)
- Breakdown by source type:
  - Bank loans
  - Personal contributions
  - Organization loans
- Number of active funding sources
- Top 3 funding sources by amount

**Actions:**

- "Add Funding Source" button
- "View All Sources" link

**Calculations:**

```typescript
totalFunded = sum(fundingSources.principalAmount)
activeFunding = sum(fundingSources.principalAmount where status = 'active')
```

**Example Display:**

```
┌─────────────────────────────────────┐
│ 💰 Total Funding                    │
│                                     │
│ ₹50,00,000                          │
│                                     │
│ Bank Loans: ₹45,00,000             │
│ Personal: ₹5,00,000                │
│                                     │
│ 2 Active Sources                    │
│                                     │
│ [+ Add Funding Source]              │
└─────────────────────────────────────┘
```

---

#### 2. Total Outgoing Payments Card

**Purpose:** Display total amount spent on property-related payments.

**Displays:**

- Total Payments (₹)
- Breakdown by payment type:
  - Builder payments
  - Registration & stamp duty
  - Valuation & document fees
  - Other payments
- Completed vs. pending payments
- Progress bar (Funded vs. Spent)

**Actions:**

- "Add Expense" button
- "View All Payments" link

**Calculations:**

```typescript
totalExpenses = sum(outgoingPayments.amount)
completedExpenses = sum(outgoingPayments.amount where status = 'completed')
pendingExpenses = sum(outgoingPayments.amount where status = 'pending')
progressPercentage = (totalExpenses / totalFunded) * 100
```

**Example Display:**

```
┌─────────────────────────────────────┐
│ 📤 Total Payments                   │
│                                     │
│ ₹15,00,000 of ₹50,00,000           │
│ [████░░░░░░] 30%                    │
│                                     │
│ Builder: ₹10,00,000                │
│ Registration: ₹3,00,000             │
│ Others: ₹2,00,000                  │
│                                     │
│ [+ Add Expense]                     │
└─────────────────────────────────────┘
```

---

#### 3. Financial Overview Card

**Purpose:** Provide key financial metrics and next payment due.

**Displays:**

- Net position (Funded - Spent)
- Total interest paid to date
- Principal vs. interest ratio
- Total remaining EMIs
- Next payment due (within 7 days)
  - Due date
  - Amount
  - Lender name

**Calculations:**

```typescript
netPosition = totalFunded - totalExpenses
totalInterestPaid = sum(incomingPayments.interestAmount where status = 'paid')
totalPrincipalPaid = sum(incomingPayments.principalAmount where status = 'paid')
principalInterestRatio = totalPrincipalPaid / totalInterestPaid
remainingEmis = count(incomingPayments where status = 'pending')
```

**Example Display:**

```
┌─────────────────────────────────────┐
│ 📊 Financial Overview               │
│                                     │
│ Net Position: ₹35,00,000           │
│ Interest Paid: ₹2,50,000           │
│ Principal/Interest: 1.8:1           │
│                                     │
│ ⚠️ Next Payment:                    │
│ HDFC Bank - ₹43,391                │
│ Due in 3 days (May 5)              │
│                                     │
│ 237 EMIs Remaining                  │
└─────────────────────────────────────┘
```

---

### Recent Activity Section

**Purpose:** Show the 5 most recent transactions (both incoming and outgoing).

**Displays:**

- Transaction type icon (incoming/outgoing)
- Description
- Amount (with color coding)
- Date
- Status badge

**Example:**

```
Recent Activity
───────────────────────────────────────
↓ EMI Payment to HDFC Bank        -₹43,391    Apr 5  [PAID]
↑ Payment from Gold Loan          +₹2,00,000  Apr 3  [RECEIVED]
↓ Builder Payment (Phase 1)       -₹5,00,000  Apr 1  [COMPLETED]
↓ EMI Payment to HDFC Bank        -₹43,391    Mar 5  [PAID]
↓ Stamp Duty Payment              -₹3,00,000  Mar 1  [COMPLETED]
```

---

## Funding Sources Management

### List View

**Purpose:** Display all funding sources in a sortable, filterable table.

**Table Columns:**

1. Lender Name
2. Source Type (badge)
3. Principal Amount
4. Interest Rate (%)
5. Tenure (months)
6. EMI Amount
7. Status (badge: Active/Closed)
8. Actions (View/Edit/Delete)

**Filters:**

- Source Type dropdown (All/Bank Loan/Personal/Organization)
- Status dropdown (All/Active/Closed)
- Date range picker
- Search by lender name

**Sort Options:**

- Lender name (A-Z)
- Amount (High to Low / Low to High)
- Interest rate (High to Low / Low to High)
- Funding date (Newest / Oldest)

**Bulk Actions:**

- Export selected to CSV
- Mark as closed

**Example Table:**

```
┌──────────────┬─────────────┬────────────┬──────┬────────┬──────────┬──────────┬─────────┐
│ Lender       │ Type        │ Principal  │ Rate │ Tenure │ EMI      │ Status   │ Actions │
├──────────────┼─────────────┼────────────┼──────┼────────┼──────────┼──────────┼─────────┤
│ HDFC Bank    │ Bank Loan   │ ₹50,00,000│ 8.5% │ 240m   │ ₹43,391 │ Active   │ ⋮       │
│ Friend-John  │ Personal    │ ₹5,00,000 │ 0%   │ 24m    │ ₹20,833 │ Active   │ ⋮       │
│ Gold Loan    │ Bank Loan   │ ₹2,00,000 │ 10%  │ 12m    │ ₹17,540 │ Closed   │ ⋮       │
└──────────────┴─────────────┴────────────┴──────┴────────┴──────────┴──────────┴─────────┘
```

---

### Detail View

**Purpose:** Show comprehensive information about a specific funding source.

**Sections:**

#### 1. Source Information

- Lender name
- Source type
- Principal amount
- Interest rate
- Tenure
- EMI amount
- Funding date
- First EMI date
- Status
- Bank details (if bank loan)
- Documents attached
- Notes

#### 2. Payment Summary

- Total amount to be repaid
- Total interest payable
- Amount paid to date
- Principal paid
- Interest paid
- Remaining balance
- EMIs completed / Total EMIs
- Next EMI due

**Calculations:**

```typescript
totalRepayable = emiAmount * tenureMonths
totalInterestPayable = totalRepayable - principalAmount
amountPaid = sum(incomingPayments.totalAmount where status = 'paid')
principalPaid = sum(incomingPayments.principalAmount where status = 'paid')
interestPaid = sum(incomingPayments.interestAmount where status = 'paid')
remainingBalance = principalAmount - principalPaid
```

#### 3. Amortization Schedule Table

**Purpose:** Show complete EMI payment schedule with payment tracking.

**Columns:**

1. EMI #
2. Due Date
3. Principal Amount
4. Interest Amount
5. Total EMI
6. Remaining Balance
7. Status (Pending/Paid/Overdue)
8. Actual Payment Date
9. Actions (Mark as Paid)

**Features:**

- Color-coded rows:
  - Green: Paid
  - Yellow: Pending
  - Red: Overdue
- Search by EMI number
- Filter by status
- Export schedule to CSV/PDF
- "Pay EMI" button for pending payments

**Calculations (for each EMI):**

```typescript
// Using reducing balance method
interest = remainingPrincipal * (interestRate / 12 / 100);
principal = emiAmount - interest;
remainingPrincipal = remainingPrincipal - principal;
```

**Example Amortization Table:**

```
┌──────┬────────────┬───────────┬──────────┬───────┬──────────┬──────────┬─────────────────┬─────────┐
│ EMI# │ Due Date   │ Principal │ Interest │ Total │ Balance  │ Status   │ Paid On         │ Actions │
├──────┼────────────┼───────────┼──────────┼───────┼──────────┼──────────┼─────────────────┼─────────┤
│ 1    │ 2024-02-05 │ ₹22,724  │ ₹20,667 │₹43,391│₹49,77,276│ Paid     │ 2024-02-05      │ ✓       │
│ 2    │ 2024-03-05 │ ₹22,885  │ ₹20,506 │₹43,391│₹49,54,391│ Paid     │ 2024-03-05      │ ✓       │
│ 3    │ 2024-04-05 │ ₹23,048  │ ₹20,343 │₹43,391│₹49,31,343│ Paid     │ 2024-04-05      │ ✓       │
│ 4    │ 2024-05-05 │ ₹23,211  │ ₹20,180 │₹43,391│₹49,08,132│ Pending  │ -               │ [Pay]   │
│ 5    │ 2024-06-05 │ ₹23,376  │ ₹20,015 │₹43,391│₹48,84,756│ Pending  │ -               │ [Pay]   │
└──────┴────────────┴───────────┴──────────┴───────┴──────────┴──────────┴─────────────────┴─────────┘
```

#### 4. Interest Analysis Chart

**Purpose:** Visualize principal vs. interest breakdown over time.

**Chart Type:** Stacked Area Chart

**X-Axis:** EMI Number (1-240)
**Y-Axis:** Amount (₹)
**Series:**

- Principal component (blue)
- Interest component (orange)

**Insights Shown:**

- Total interest paid so far
- Projected total interest
- Month when interest < principal (crossover point)
- Interest percentage of each EMI

---

### Add Funding Source

**Purpose:** Create a new funding source record.

**Form Fields:**

1. **Source Type** (required, dropdown)

   - Bank Loan
   - Personal Contribution
   - Organization Loan

2. **Lender Name** (required, text)

   - Placeholder: "e.g., HDFC Bank, Friend - John"

3. **Principal Amount** (required, number)

   - Minimum: 1
   - Format: Currency input with ₹ prefix

4. **Interest Rate** (required, number)

   - Range: 0-30%
   - Step: 0.1
   - Help text: "Annual interest rate. Enter 0 for interest-free loans"

5. **Tenure** (required, number)

   - In months
   - Range: 1-360
   - Help text: "Total loan duration in months"

6. **EMI Amount** (required, number)

   - Auto-calculated or manual entry
   - Calculator button to compute

7. **EMI Payment Method** (dropdown)

   - Auto Debit
   - Bank Transfer
   - Check
   - Cash

8. **Funding Date** (required, date)

   - When funds were received

9. **EMI Start Date** (date)

   - When first EMI is due

10. **Bank Details** (conditional - show if sourceType = 'bank_loan')

    - Bank Name
    - Branch Name
    - Loan Account Number
    - IFSC Code

11. **Documents** (file upload)

    - Multiple files allowed
    - Formats: PDF, JPG, PNG
    - Max size: 5MB per file
    - Types: Loan agreement, sanction letter, etc.

12. **Notes** (textarea)
    - Optional additional information

**Validation Rules:**

- Principal amount must be positive
- Interest rate must be 0-30
- Tenure must be at least 1 month
- EMI amount must be positive if tenure > 0
- Funding date cannot be in the future
- EMI start date must be after funding date

**EMI Calculator:**

```typescript
function calculateEMI(principal: number, rate: number, tenure: number): number {
  if (rate === 0) {
    return principal / tenure;
  }
  const monthlyRate = rate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
}
```

**Post-Creation Actions:**

1. Generate complete amortization schedule
2. Create all EMI payment records with status "pending"
3. Navigate to funding source detail page
4. Show success notification
5. Trigger welcome email (optional)

---

## EMI Payment Tracking

### Upcoming EMI Payments View

**Purpose:** Show all upcoming EMI payments in the next 30 days.

**Display:**

- Card for each upcoming payment
- Sorted by due date (nearest first)
- Color-coded by urgency:
  - Red: Due in 0-3 days
  - Yellow: Due in 4-7 days
  - Blue: Due in 8-30 days

**Information Per Card:**

- Lender name
- EMI number (e.g., "EMI #4 of 240")
- Due date
- Days until due
- Total amount
- Principal/Interest breakdown
- Payment method
- "Mark as Paid" button

**Example:**

```
┌─────────────────────────────────────┐
│ ⚠️ HDFC Bank Home Loan              │
│                                     │
│ EMI #4 of 240                       │
│ Due: May 5, 2024 (in 3 days)       │
│                                     │
│ Total: ₹43,391                     │
│ Principal: ₹23,211                 │
│ Interest: ₹20,180                  │
│                                     │
│ Method: Auto Debit                  │
│                                     │
│ [Mark as Paid]                      │
└─────────────────────────────────────┘
```

---

### Payment History View

**Purpose:** Show all past EMI payments across all funding sources.

**Table Columns:**

1. Payment Date
2. Lender Name
3. EMI Number
4. Principal Amount
5. Interest Amount
6. Total Amount
7. Payment Method
8. Transaction ID
9. Status

**Filters:**

- Date range
- Lender (multi-select)
- Payment method
- Status

**Summary Cards:**

- Total EMIs paid
- Total amount paid
- Total principal paid
- Total interest paid

---

### Mark EMI as Paid

**Purpose:** Record an EMI payment and update status.

**Modal Form Fields:**

1. **Actual Payment Date** (required)
   - Default: Today
2. **Payment Method** (required, dropdown)
   - Auto Debit
   - Bank Transfer
   - Check
   - Cash
3. **Transaction ID** (optional, text)
   - Bank reference number
4. **Receipt** (file upload)
   - PDF/Image of payment receipt
5. **Notes** (textarea)

**Actions on Submit:**

1. Update payment status to "paid"
2. Record actual payment date
3. Update funding source summary
4. Recalculate remaining balance
5. Send confirmation notification
6. Update analytics

---

## Outgoing Payments Management

### Payment Categories

**Builder Payments:**

- Booking amount
- Down payment
- Construction phase payments
- Possession charges

**Registration & Legal:**

- Stamp duty
- Registration fees
- Legal fees
- Notary charges

**Valuation & Documentation:**

- Property valuation fees
- Document verification charges
- Processing fees

**Interior & Others:**

- Interior work
- Furniture
- Appliances
- Miscellaneous payments

---

### List View

**Purpose:** Display all outgoing payments in a table.

**Table Columns:**

1. Payment Date
2. Payment Type (badge)
3. Paid To
4. Amount
5. Payment Method
6. Reference Number
7. Status (badge)
8. Actions

**Filters:**

- Payment type (multi-select)
- Date range
- Payment method
- Status (Pending/Completed)
- Amount range

**Sort Options:**

- Date (newest/oldest)
- Amount (high/low)
- Payment type

**Summary:**

- Total Payments
- Completed payments
- Pending payments
- Breakdown by category (pie chart)

---

### Add Outgoing Payment

**Form Fields:**

1. **Payment Type** (required, dropdown)

   - See payment categories above

2. **Payment To** (required, text)

   - Recipient name
   - Autocomplete from previous entries

3. **Amount** (required, number)

   - Currency format

4. **Payment Date** (required, date)

5. **Payment Method** (required, dropdown)

   - Bank Transfer
   - Check
   - Cash
   - Card

6. **Description** (textarea)

   - Detailed description of payment

7. **Reference Number** (text)

   - Invoice number, booking ID, etc.

8. **Category** (text)

   - Custom categorization
   - Autocomplete from previous

9. **Documents** (file upload)

   - Receipts, invoices
   - Multiple files allowed

10. **Status** (dropdown)

    - Pending
    - Completed

11. **Notes** (textarea)

**Quick Add Templates:**

- Pre-filled forms for common payment types
- Save custom templates

---

## Analytics & Insights

### Dashboard Analytics

#### 1. Interest Analysis

**Total Interest Metrics:**

- Total interest paid to date
- Total interest payable (projected)
- Average interest rate across all loans
- Interest saved (if any prepayments)

**Interest Distribution Chart (Pie):**

- Shows which loan contributes most interest
- Breakdown by lender

**Interest Over Time Chart (Line):**

- Cumulative interest paid
- X-axis: Months
- Y-axis: Amount
- Compare multiple loans

**Principal vs. Interest Ratio:**

- Current ratio
- Projected ratio at loan completion
- Breakeven point timeline

---

#### 2. Loan-wise Breakdown

**Summary Table:**

| Loan | Principal | Rate | Total Interest | Paid EMIs | Remaining | Status |
| ---- | --------- | ---- | -------------- | --------- | --------- | ------ |
| HDFC | ₹50L      | 8.5% | ₹1.04Cr        | 3/240     | 237       | Active |
| Gold | ₹2L       | 10%  | ₹20K           | 12/12     | 0         | Closed |

**Per-Loan Charts:**

- Payment progress (donut chart)
- Principal vs. interest breakdown
- Monthly payment timeline

---

#### 3. Payment Timeline

**Gantt Chart View:**

- Timeline of all funding received (top)
- Timeline of all payments paid (bottom)
- Visual comparison of inflow vs. outflow
- Identify cash flow gaps

**Cashflow Chart:**

- Monthly net cashflow
- Stacked bar: Funding received vs. Payments paid
- Running balance line

---

#### 4. Bank-wise Summary

**For each bank:**

- Total amount borrowed
- Number of loans
- Average interest rate
- Total EMIs paid
- Total amount repaid
- Remaining balance

**Bank Comparison Chart:**

- Compare interest rates
- Compare repayment progress

---

#### 5. Payment Method Analysis

**Breakdown:**

- Amount paid via each method
- Frequency of each method
- Preference trends

**Chart (Bar):**

- X-axis: Payment methods
- Y-axis: Total amount

---

### Export Analytics

**Export Options:**

- Date range selection
- Format: PDF/Excel/CSV
- Include charts (PDF only)
- Email report option

---

## Reports & Export

### 1. Financial Summary Report

**Parameters:**

- Date range (From - To)
- Include specific sections (checkboxes)

**Report Sections:**

**A. Summary:**

- Total funded
- Total Payments
- Net position
- Total interest paid

**B. Funding Breakdown:**

- List all funding sources
- Amount from each
- Subtotals by type

**C. Expense Breakdown:**

- List all outgoing payments
- Subtotals by category

**D. EMI Summary:**

- Total EMIs paid
- Principal paid
- Interest paid
- Remaining EMIs

**E. Monthly Breakdown:**

- Month-wise funding received
- Month-wise payments paid
- Net monthly cashflow

**Export Formats:**

- PDF (formatted report)
- Excel (with formulas)
- CSV (raw data)

---

### 2. Payment History Report

**Filters:**

- Date range
- Payment type (Incoming/Outgoing/Both)
- Specific lenders/recipients
- Status

**Columns:**

- Date
- Type (In/Out)
- From/To
- Description
- Amount
- Method
- Status

**Summary:**

- Total incoming
- Total outgoing
- Net flow

---

### 3. Tax Report

**Purpose:** Prepare data for tax filing.

**Includes:**

- Interest paid (for tax deduction)
- Principal repaid
- Lender details
- Certificate format (Form 16/similar)

---

### 4. Upcoming Obligations Report

**Purpose:** Forecast future payments.

**Timeframes:**

- Next 3 months
- Next 6 months
- Next 12 months

**Shows:**

- All upcoming EMIs
- Estimated construction payments
- Other scheduled payments
- Total projected outflow

**Calendar Export:**

- iCal format
- Import to Google Calendar/Outlook

---

## Settings & Configuration

### 1. Profile Settings

**Editable Fields:**

- Username
- Email (with re-verification)
- Phone number
- Home address
- Profile picture

**Password Management:**

- Change password
- Enable 2FA (future)

---

### 2. Reminder Settings

**Email Reminders:**

**Global Toggle:**

- Enable/Disable all reminders

**EMI Reminders:**

- Enable/Disable
- Days before due (1-30)
- Frequency:
  - Once before due date
  - Weekly until paid
  - Daily until paid

**Expense Reminders:**

- Enable/Disable
- For specific payment types (multi-select)
- Days before due

**Recipients:**

- Primary email (user's email)
- Additional emails (comma-separated)
- Maximum 5 emails

**Testing:**

- "Send Test Email" button
- Preview email template

---

### 3. Preferences

**Currency:**

- Currency code (INR, USD, etc.)
- Currency symbol (₹, $, etc.)

**Date & Time:**

- Timezone
- Date format (DD/MM/YYYY, MM/DD/YYYY, etc.)
- Time format (12h/24h)

**Localization:**

- Language (English, Hindi, etc.)

**Theme:**

- Dark (forced for now)
- Light (future)
- Auto (future)

**Notifications:**

- Browser notifications
- Email digest frequency (Daily/Weekly/Monthly)

---

### 4. Data Management

**Export All Data:**

- Download complete data backup
- Format: JSON/CSV
- Includes all funding sources, payments, documents

**Import Data:**

- Upload data from backup
- CSV import for bulk funding sources/payments

**Delete Account:**

- Permanent account deletion
- Export data first option
- Confirmation required

---

## Email Reminders

### Automated Email System

**Cron Job Schedule:**

- Runs daily at 6:00 AM (configurable)
- Checks all users' upcoming payments
- Sends reminders based on user settings

**Email Types:**

#### 1. EMI Reminder Email

**Trigger:** X days before EMI due (user-configured)

**Subject:** `EMI Payment Reminder - [Lender Name] - Due [Date]`

**Content:**

- Greeting with username
- EMI details:
  - Lender name
  - EMI number
  - Amount
  - Due date
  - Days until due
- Payment method reminder
- Quick link to dashboard
- Contact/support info

**Template Variables:**

```
{{username}}
{{lenderName}}
{{emiNumber}}
{{amount}}
{{dueDate}}
{{daysUntilDue}}
{{dashboardUrl}}
```

---

#### 2. Overdue Payment Alert

**Trigger:** Payment not marked as paid after due date

**Subject:** `⚠️ Overdue Payment Alert - [Lender Name]`

**Content:**

- Alert about overdue payment
- Payment details
- Potential consequences
- Instructions to mark as paid
- Contact support link

---

#### 3. Monthly Summary Email

**Trigger:** 1st of every month

**Subject:** `Your Monthly Financial Summary - [Month Year]`

**Content:**

- Total payments made last month
- Upcoming payments this month
- Current financial position
- Interest paid last month
- Link to detailed report

---

#### 4. Payment Confirmation

**Trigger:** User marks payment as paid

**Subject:** `Payment Recorded - [Lender Name]`

**Content:**

- Confirmation of payment recorded
- Payment details
- Updated loan balance
- Remaining EMIs
- Receipt attachment (if uploaded)

---

### Email Customization

**Sender Details:**

- From Name: "Housing Management Platform"
- From Email: "noreply@yourdomain.com"
- Reply-To: "support@yourdomain.com"

**Branding:**

- Logo in header
- Brand colors
- Footer with links:
  - Dashboard
  - Settings
  - Help Center
  - Unsubscribe

**Unsubscribe Handling:**

- Link in every email
- Updates user preferences
- Confirmation message
- Option to re-subscribe

---

## Mobile Responsiveness

### Breakpoints

```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

### Mobile Adaptations

**Navigation:**

- Sidebar converts to bottom tab bar
- Hamburger menu for secondary navigation
- Swipe gestures supported

**Tables:**

- Convert to card layout
- Expandable rows
- Horizontal scroll for large tables
- Filter panel as drawer

**Charts:**

- Touch-friendly tooltips
- Simplified legends
- Responsive sizing
- Swipe to see different views

**Forms:**

- Single column layout
- Larger input fields
- Touch-optimized date/number pickers
- Bottom sheet for modals

**Cards:**

- Stack vertically
- Full-width on mobile
- Collapsible sections

---

This completes the comprehensive feature documentation for the Housing Management Platform!

# Reports Section Documentation

## Overview

The Reports section provides comprehensive financial reports with detailed insights and export capabilities for your home buying financial journey.

## Features

### 1. **Summary Dashboard**

- **Total Funding**: Complete principal amount from all funding sources
- **Total Interest**: Calculated interest amount over the entire loan tenure
- **Total Payments**: Sum of all paid and pending payments
- **Available Balance**: Funding minus payments

### 2. **Financial Summary Report**

Displays a complete overview with:

- **Funding Details**
  - Total Principal
  - Total Interest (calculated from all loans)
  - Total Repayment Amount (Principal + Interest)
- **Payments Details**
  - Amount Paid
  - Amount Pending
  - Total Payments
- **Monthly EMI Commitment**
  - Shows total monthly payment across all active loans

### 3. **Detailed Reports (Tabbed Interface)**

#### Tab 1: Summary

- Complete financial overview
- Split into Funding and Payments sections
- Highlights monthly EMI commitment

#### Tab 2: Funding Sources Report

- Lists all funding sources with:
  - Source name
  - Type (Bank Loan, Personal Contribution, etc.)
  - Principal amount
  - Interest rate
  - Tenure in months
  - EMI amount
  - Status (Active/Closed)
- Export to CSV functionality

#### Tab 3: Outgoing Payments Report

- Lists all payments with:
  - Category (Builder Payment, Registration, etc.)
  - Description
  - Amount
  - Payment date
  - Status (Paid/Pending)
- Export to CSV functionality

#### Tab 4: EMI Payments Report

- Lists all EMI/loan payments with:
  - Funding source name
  - Payment amount
  - Payment date
  - Payment type
  - Status (Paid/Pending)
- Export to CSV functionality

### 4. **Export Functionality**

All reports can be exported to CSV format:

- **Summary Export**: Exports complete financial summary
- **Funding Export**: Exports all funding sources details
- **Outgoing Export**: Exports all expense records
- **Incoming Export**: Exports all EMI payment records

CSV files include proper headers and formatting for easy import into Excel or Google Sheets.

## Color Coding

### Cards & Metrics

- 🔵 **Blue**: Funding/Assets
- 🟠 **Amber**: Interest/EMI/Pending items
- 🔴 **Red**: Payments/Liabilities
- 🟢 **Green**: Available balance/Paid items

### Status Badges

- 🟢 **Green**: Active/Paid status
- 🟠 **Amber**: Pending status
- ⚪ **Gray**: Closed/Inactive status

## Usage

### Accessing Reports

1. Navigate to **Dashboard → Reports** from the sidebar
2. View the summary dashboard at the top
3. Switch between tabs for detailed reports
4. Click "Export CSV" buttons to download data

### Understanding the Data

#### Total Interest Calculation

- Calculated using the EMI amortization schedule
- Based on principal amount, interest rate, and tenure
- Shows the complete interest payable over loan duration

#### Available Balance

```
Available Balance = Total Funding - Total Payments
```

#### Monthly EMI Commitment

- Sum of all EMI amounts from active funding sources
- Excludes closed or completed loans
- Represents your monthly financial obligation

### Export Features

1. **Summary Export** - Click "Export Summary" button in header
2. **Detailed Exports** - Click "Export CSV" in respective tab cards
3. Files download automatically with descriptive names
4. Format: UTF-8 CSV with comma separators

## Data Sources

All data is fetched real-time from Firebase Firestore:

- `users/{userId}/fundingSources` - Funding sources data
- `users/{userId}/outgoingPayments` - Expense data
- `users/{userId}/incomingPayments` - EMI payment data

## Technical Details

### Components Used

- shadcn/ui: Card, Table, Tabs, Button
- Lucide Icons: Visual indicators
- EMI Calculator: Interest calculation
- Firebase Firestore: Data storage
- Sonner: Toast notifications

### Calculations

- **EMI**: Using standard EMI formula with monthly interest rate
- **Interest**: Generated from amortization schedules
- **Balance**: Simple subtraction of payments from funding

## Future Enhancements

- 📊 PDF export with charts
- 📈 Year-over-year comparisons
- 📅 Date range filters
- 🔍 Advanced search and filtering
- 📱 Print-friendly layouts
- 📧 Email report scheduling

## Tips

1. Export reports regularly for record-keeping
2. Use Summary tab for quick overview
3. Check detailed tabs for transaction-level insights
4. Monitor monthly EMI commitment for budgeting
5. Track Available Balance to ensure sufficient funds

## Support

For issues or questions about the Reports section, refer to the main documentation or contact support.

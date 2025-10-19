# Enhanced Home Buying & Finance Management Platform

A comprehensive, single-page web application for managing the entire home buying financial journey. Track funding sources, EMI payments, builder payments, and analyze complete financial metrics with advanced filtering and reporting.

## 🎯 Project Overview

This platform helps users manage:

- **Funding Sources**: Track loans from banks, personal contributions, and organizational loans
- **EMI Payments**: Monitor and schedule all EMI payments with automated reminders
- **Outgoing Expenses**: Record payments to builders, valuations, document fees, stamp duty, etc.
- **Analytics**: Comprehensive financial insights with charts and reports
- **Automated Reminders**: Email notifications for upcoming payments

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS (Dark Theme)
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts
- **Tables**: TanStack Table (React Table)
- **Animations**: Framer Motion

### Backend

- **Framework**: FastAPI (Python)
- **Authentication**: JWT
- **Email**: SendGrid
- **Scheduling**: APScheduler
- **Validation**: Pydantic

### Database

- **Primary**: Cloud Firestore (Firebase)
- **Real-time Sync**: Firestore listeners

## 📁 Project Structure

```
housing-management/
├── frontend/                 # Next.js application
│   ├── app/                 # Next.js 14 app directory
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Main dashboard & features
│   │   └── components/     # Reusable components
│   ├── lib/                # Utilities & helpers
│   ├── styles/             # Global styles
│   └── public/             # Static assets
├── backend/                 # FastAPI application
│   ├── api/                # API routes
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── main.py             # Application entry
├── docs/                    # Documentation
│   ├── 01-SETUP-GUIDE.md
│   ├── 02-DATABASE-SCHEMA.md
│   ├── 03-API-DOCUMENTATION.md
│   ├── 04-FRONTEND-GUIDE.md
│   ├── 05-DEPLOYMENT.md
│   └── 06-FEATURES.md
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Firebase account
- SendGrid account (for emails)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd housing-management
```

2. **Frontend Setup**

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

3. **Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure your environment variables
uvicorn main:app --reload
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

1. **[Setup Guide](./docs/01-SETUP-GUIDE.md)** - Complete setup instructions
2. **[Database Schema](./docs/02-DATABASE-SCHEMA.md)** - Firestore data models
3. **[API Documentation](./docs/03-API-DOCUMENTATION.md)** - Backend API reference
4. **[Frontend Guide](./docs/04-FRONTEND-GUIDE.md)** - Component architecture
5. **[Deployment](./docs/05-DEPLOYMENT.md)** - Production deployment guide
6. **[Features](./docs/06-FEATURES.md)** - Detailed feature documentation

## 🎨 Design System

### Dark Theme Colors

- **Primary Dark**: #0F172A (Slate-900)
- **Secondary Dark**: #1E293B (Slate-800)
- **Accent**: #3B82F6 (Blue-500)
- **Success**: #10B981 (Emerald-500)
- **Warning**: #F59E0B (Amber-500)
- **Danger**: #EF4444 (Red-500)

## 🔑 Key Features

### 1. Dashboard

- Total Funding Summary
- Total Outgoing Expenses
- Financial Overview with Net Position
- Quick action buttons

### 2. Funding Sources Management

- Add/Edit/Delete funding sources
- Amortization schedule tracking
- EMI payment recording
- Document management

### 3. Outgoing Payments

- Track all expenses (builder, fees, duties)
- Categorized payment types
- Receipt uploads
- Payment timeline

### 4. Analytics

- Interest analysis and breakdown
- Loan-wise summaries
- Payment method analysis
- Timeline visualizations

### 5. Reports & Export

- Financial summary reports
- Payment history
- CSV/PDF export
- Custom date ranges

### 6. Automated Reminders

- Email notifications for upcoming EMIs
- Configurable reminder settings
- Multi-recipient support

## 🔐 Security

- JWT-based authentication
- Secure password hashing
- Email verification
- Token refresh mechanism
- CORS protection
- Environment variable management

## 📱 Mobile Responsive

Fully responsive design that works seamlessly on:

- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚢 Deployment

- **Frontend**: Vercel with GitHub auto-deploy
- **Backend**: Render or Railway
- **Database**: Firebase (Cloud Firestore)
- **Email**: SendGrid

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for simplifying home buying financial management**

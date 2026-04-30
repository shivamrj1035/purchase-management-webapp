# Production Deployment Script for Windows
# This script helps prepare your app for production deployment

Write-Host "🚀 Property Purchase Management - Production Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Print-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

# Check current branch
Write-Host "📍 Checking current branch..."
$currentBranch = git branch --show-current
if ($currentBranch -ne "production") {
    Print-Warning "You are on branch '$currentBranch', not 'production'"
    $switch = Read-Host "Switch to production branch(y/n)"
    if ($switch -eq "y" -or $switch -eq "Y") {
        git checkout production
        Print-Success "Switched to production branch"
    } else {
        Print-Error "Deployment cancelled"
        exit 1
    }
} else {
    Print-Success "On production branch"
}

# Pull latest changes
Write-Host ""
Write-Host "📥 Pulling latest changes..."
git pull origin production
Print-Success "Latest changes pulled"

# Check for uncommitted changes
Write-Host ""
Write-Host "🔍 Checking for uncommitted changes..."
$status = git status -s
if ($status) {
    Print-Warning "You have uncommitted changes:"
    git status -s
    $commit = Read-Host "Commit changes(y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMsg = Read-Host "Enter commit message"
        git add .
        git commit -m "$commitMsg"
        Print-Success "Changes committed"
    } else {
        Print-Error "Please commit or stash your changes before deploying"
        exit 1
    }
} else {
    Print-Success "No uncommitted changes"
}

# Check environment files
Write-Host ""
Write-Host "🔐 Checking environment files..."

# Backend .env
if (Test-Path "backend\.env") {
    Print-Success "Backend .env file exists"
} else {
    Print-Warning "Backend .env file not found"
    Write-Host "Please create backend\.env from backend\.env.example"
}

# Frontend .env.local
if (Test-Path "frontend\.env.local") {
    Print-Success "Frontend .env.local file exists"
} else {
    Print-Warning "Frontend .env.local file not found"
    Write-Host "Please create frontend\.env.local from frontend\.env.example"
}

# Test backend dependencies
Write-Host ""
Write-Host "🐍 Testing backend dependencies..."
Set-Location backend
if (Test-Path "venv") {
    & .\venv\Scripts\Activate.ps1
} else {
    Print-Warning "Virtual environment not found, creating one..."
    python -m venv venv
    & .\venv\Scripts\Activate.ps1
}
pip install -r requirements.txt | Out-Null
Print-Success "Backend dependencies installed"
Set-Location ..

# Test frontend dependencies
Write-Host ""
Write-Host "📦 Testing frontend dependencies..."
Set-Location frontend
npm install | Out-Null
Print-Success "Frontend dependencies installed"

# Build frontend
Write-Host ""
Write-Host "🏗️  Building frontend..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Print-Success "Frontend build successful"
} else {
    Print-Error "Frontend build failed"
    Set-Location ..
    exit 1
}
Set-Location ..

# Push to production
Write-Host ""
Write-Host "🚢 Ready to deploy to production"
Write-Host ""
$deploy = Read-Host "Push to production branch(y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    git push origin production
    Print-Success "Pushed to production branch"
    Write-Host ""
    Write-Host "✅ Deployment triggered!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next steps:"
    Write-Host "  1. Monitor Vercel deployment: https://vercel.com/dashboard"
    Write-Host "  2. Monitor Render deployment: https://dashboard.render.com"
    Write-Host "  3. Test your application after deployment"
    Write-Host ""
} else {
    Print-Warning "Deployment cancelled"
}

Write-Host ""
Write-Host "🎉 Script completed!" -ForegroundColor Cyan

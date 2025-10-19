#!/bin/bash

# Production Deployment Script
# This script helps prepare your app for production deployment

set -e  # Exit on error

echo "🚀 Property Purchase Management - Production Deployment"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check current branch
echo "📍 Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "production" ]; then
    print_warning "You are on branch '$CURRENT_BRANCH', not 'production'"
    read -p "Switch to production branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout production
        print_success "Switched to production branch"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
else
    print_success "On production branch"
fi

# Pull latest changes
echo ""
echo "📥 Pulling latest changes..."
git pull origin production
print_success "Latest changes pulled"

# Check for uncommitted changes
echo ""
echo "🔍 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes:"
    git status -s
    read -p "Commit changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        print_success "Changes committed"
    else
        print_error "Please commit or stash your changes before deploying"
        exit 1
    fi
else
    print_success "No uncommitted changes"
fi

# Check environment files
echo ""
echo "🔐 Checking environment files..."

# Backend .env
if [ -f "backend/.env" ]; then
    print_success "Backend .env file exists"
else
    print_warning "Backend .env file not found"
    echo "Please create backend/.env from backend/.env.example"
fi

# Frontend .env.local
if [ -f "frontend/.env.local" ]; then
    print_success "Frontend .env.local file exists"
else
    print_warning "Frontend .env.local file not found"
    echo "Please create frontend/.env.local from frontend/.env.example"
fi

# Test backend dependencies
echo ""
echo "🐍 Testing backend dependencies..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
else
    print_warning "Virtual environment not found, creating one..."
    python3 -m venv venv
    source venv/bin/activate
fi
pip install -r requirements.txt > /dev/null 2>&1
print_success "Backend dependencies installed"
cd ..

# Test frontend dependencies
echo ""
echo "📦 Testing frontend dependencies..."
cd frontend
npm install > /dev/null 2>&1
print_success "Frontend dependencies installed"

# Build frontend
echo ""
echo "🏗️  Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Push to production
echo ""
echo "🚢 Ready to deploy to production"
echo ""
read -p "Push to production branch? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin production
    print_success "Pushed to production branch"
    echo ""
    echo "✅ Deployment triggered!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Monitor Vercel deployment: https://vercel.com/dashboard"
    echo "  2. Monitor Render deployment: https://dashboard.render.com"
    echo "  3. Test your application after deployment"
    echo ""
else
    print_warning "Deployment cancelled"
fi

echo ""
echo "🎉 Script completed!"

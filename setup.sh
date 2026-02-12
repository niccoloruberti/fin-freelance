#!/bin/bash

# FinFreelance Setup Script
# This script helps you set up the entire project

echo "🚀 FinFreelance Setup"
echo "===================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed."
    exit 1
fi

if ! command_exists docker; then
    echo "⚠️  Docker is not installed. You'll need to set up MySQL manually."
    USE_DOCKER=false
else
    USE_DOCKER=true
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

echo "Installing backend dependencies..."
npm install

cd ..
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

cd ..
echo "✅ Frontend setup complete"
echo ""

# Setup Database
if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Starting MySQL with Docker..."
    docker-compose up -d mysql
    
    echo "Waiting for MySQL to be ready..."
    sleep 10
    
    echo "✅ MySQL is running"
    echo ""
    
    echo "📊 Running database migrations..."
    cd backend
    npm run migration:run
    cd ..
    
    echo "✅ Database setup complete"
else
    echo "⚠️  Please set up MySQL manually:"
    echo "   1. Install MySQL 8.0+"
    echo "   2. Create database: CREATE DATABASE finfreelance;"
    echo "   3. Update backend/.env with your MySQL credentials"
    echo "   4. Run: cd backend && npm run migration:run"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Review and update environment files:"
echo "   - backend/.env"
echo "   - frontend/.env"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - Backend: backend/README.md"
echo "   - Frontend: frontend/README.md"
echo "   - Main: README.md"
echo ""
echo "🐛 Having issues? Check the Troubleshooting sections in the README files"
echo ""

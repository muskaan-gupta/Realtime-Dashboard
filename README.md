# Real-Time Business Analytics Dashboard

A comprehensive full-stack web application that provides real-time business metrics tracking with live updates using WebSocket technology.

## 🚀 Features

### Core Features
- **Real-time Analytics Dashboard** - Live KPI tracking with auto-refresh
- **User Authentication** - Role-based access control (Admin/Viewer)
- **Interactive Charts** - Revenue trends and category breakdowns
- **Live Data Updates** - WebSocket-powered real-time notifications
- **Data Management** - CRUD operations for sales and orders
- **Responsive Design** - Mobile-friendly interface
- **Dark/Light Mode** - Theme switching capability

### Dashboard Components
- **KPI Cards** - Total Sales, Revenue, Orders, Users with growth indicators
- **Revenue Trends Chart** - Line chart showing revenue over time
- **Category Analysis** - Bar chart for product category performance
- **Recent Transactions Table** - Sortable and filterable transaction list
- **Real-time Notifications** - Live updates for new sales and orders
- **Connection Status** - WebSocket connection monitoring

### Admin Features
- **Sample Data Generation** - Create test data for demonstration
- **Data Export** - Download analytics data as CSV
- **User Management** - Role-based access control
- **System Monitoring** - Connection status and user tracking

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive data visualization
- **Lucide React** - Modern icon library
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/realtime-analytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup
```bash
# Create demo users (admin and viewer accounts)
npm run setup
```

### 4. Start the Application
```bash
# Development mode with hot reload
npm run dev

# The app will be available at http://localhost:3000
```

## 👥 Demo Accounts

After running `npm run setup`, you can login with:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `admin123`

**Viewer Account:**
- Email: `viewer@demo.com`
- Password: `viewer123`

## 📖 Usage Guide

### Getting Started
1. **Login** - Use the demo credentials
2. **Generate Sample Data** - Go to Admin panel and click "Generate Data"
3. **View Dashboard** - Navigate to the main dashboard to see analytics
4. **Real-time Updates** - Watch data update live as changes occur

## 🧪 Testing

### Sample Data Testing
1. Login as Admin
2. Go to Admin panel
3. Click "Generate Data" to create sample records
4. Return to Dashboard to see updated analytics

## 🐛 Troubleshooting

**MongoDB Connection Failed**
- Ensure MongoDB is running locally
- Check connection string in .env.local

**WebSocket Connection Issues**
- Verify port 3000 is available
- Check CORS settings


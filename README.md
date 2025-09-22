# 🌊 INCOIS Ocean Hazard Reporting Platform

## 📖 Project Overview

The **INCOIS Ocean Hazard Reporting Platform** is a comprehensive solution for monitoring and reporting ocean hazards developed for **SIH 2025**. The platform consists of a mobile application for field reporting, a backend API for data management, and a web dashboard for analysis and monitoring.

### 🎯 Key Features
- 📱 **Mobile App**: Real-time hazard reporting with location tracking and image upload
- 🖥️ **Web Dashboard**: Administrative interface for report verification and monitoring
- 🚀 **Backend API**: RESTful API with MongoDB database and AI-powered verification
- 🔒 **Authentication**: Firebase-based user authentication system
- 📊 **Data Management**: Role-based access control for analysts and administrators

## 🏗️ Project Architecture

```
📁 404-Founders-SIH25039/
├── 📱 mobile-app/          # React Native/Expo mobile application
├── 🖥️ dashboard/           # React.js web dashboard
├── 🚀 server/              # Node.js/Express backend API
├── 📋 package.json         # Root package configuration
├── 🔒 .gitignore          # Git ignore rules
└── 📖 README.md           # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Expo CLI** (`npm install -g @expo/cli`)
- **MongoDB Atlas** account (or local MongoDB)
- **Firebase** project
- **Cloudinary** account

## 📋 Detailed Setup Instructions

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/anish1206/404-Founders-SIH25039.git
cd 404-Founders-SIH25039
```

### 2. 🚀 Backend Server Setup

#### Navigate to server directory:
```bash
cd server
```

#### Install dependencies:
```bash
npm install
```

#### Environment Configuration:
```bash
# Copy the environment template
cp .env.example .env
```

#### Configure `.env` file:
```env
# MongoDB Connection (Replace with your credentials)
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority&appName=ClusterName

# Server Configuration
PORT=5000

# JWT Secret (for future authentication features)
JWT_SECRET=your_super_secret_jwt_key_here
```

#### Start the server:
```bash
npm start
```

**Expected Output:**
```
Server is listening on port 5000
Successfully connected to MongoDB Atlas!
INCOIS Hazard Platform API is running!
```

#### Test the server:
Open browser and visit: `http://localhost:5000`
Should display: "INCOIS Hazard Platform API is running!"

### 3. 📱 Mobile App Setup

#### Navigate to mobile-app directory:
```bash
cd ../mobile-app
```

#### Install dependencies:
```bash
npm install
npx expo install expo-linear-gradient
```

#### Environment Configuration:
```bash
# Copy the environment template
cp .env.example .env
```

#### Configure `.env` file:
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
EXPO_PUBLIC_FIREBASE_APP_ID="your_app_id"
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_upload_preset"

# API Configuration (Replace with your computer's IP address)
EXPO_PUBLIC_API_BASE_URL="http://YOUR_COMPUTER_IP:5000"
```

#### Find your computer's IP address:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

#### Start the mobile app:
```bash
npx expo start
```

#### Test on device:
1. Install **Expo Go** app on your mobile device
2. Scan the QR code displayed in terminal
3. Ensure your phone and computer are on the same WiFi network

### 4. 🖥️ Dashboard Setup

#### Navigate to dashboard directory:
```bash
cd ../dashboard
```

#### Install dependencies:
```bash
npm install
```

#### Environment Configuration:
```bash
# Copy the environment template
cp .env.example .env
```

#### Configure `.env` file:
```env
# Firebase Configuration (same as mobile app)
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"

# API Configuration
VITE_API_BASE_URL="http://localhost:5000"
```

#### Start the dashboard:
```bash
npm run dev
```

Dashboard will be available at: `http://localhost:5173`

## 🔧 Third-Party Service Setup

### 🔥 Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password

2. **Get Configuration:**
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config object
   - Use these values in your `.env` files

3. **Configure Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider

### 🎨 Cloudinary Setup

1. **Create Cloudinary Account:**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free account

2. **Get Credentials:**
   - Go to Dashboard
   - Copy your "Cloud Name"
   - Create an upload preset in Settings → Upload

3. **Configure Upload Preset:**
   - Go to Settings → Upload → Upload presets
   - Create unsigned upload preset
   - Use the preset name in your `.env` file

### 🗄️ MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free cluster

2. **Database Configuration:**
   - Create database user
   - Configure network access (allow your IP)
   - Get connection string

3. **Connect:**
   - Replace `<username>`, `<password>`, and `<dbname>` in connection string
   - Use this in your server's `.env` file

## 📱 Mobile App Features

### 🔐 Authentication
- Email/password login and registration
- Firebase Authentication integration
- Secure user session management

### 📍 Hazard Reporting
- Location-based reporting with GPS
- Image capture and upload
- Hazard type categorization
- Real-time form validation

### 🎨 Modern UI
- Ocean-themed gradient design
- Material Design components
- Responsive layout
- Loading states and error handling

## 🖥️ Dashboard Features

### 👤 User Management
- Role-based access control
- Admin and analyst roles
- Secure authentication

### 📊 Report Management
- View all submitted reports
- Verify and approve reports
- Map visualization
- Status tracking

## 🚀 Backend API Features

### 🛡️ Security
- CORS configuration
- Input validation
- Error handling
- Environment-based configuration

### 📡 Endpoints
- `GET /` - Health check
- `POST /api/reports` - Submit new report
- `GET /api/reports` - Retrieve reports (role-based)
- `GET /api/reports/hotspots` - Get hazard hotspots

### 🗄️ Database
- MongoDB with Mongoose ODM
- Geospatial data support
- Indexed queries for performance

## 🔒 Security Best Practices

### 🛡️ Environment Variables
- All sensitive data in `.env` files
- `.env` files excluded from git
- Separate configurations for each environment

### 🔐 Authentication
- Firebase Authentication integration
- JWT tokens for API access
- Role-based access control

### 🌐 Network Security
- CORS properly configured
- Input validation and sanitization
- Error handling without data exposure

## 🚨 Troubleshooting

### 📱 Mobile App Issues

**Network Error:**
- Ensure server is running on correct IP
- Check if phone and computer are on same WiFi
- Verify firewall settings
- Check IP address in `.env` file

**Authentication Error:**
- Verify Firebase configuration
- Check internet connection
- Ensure Firebase project has Email/Password enabled

### 🖥️ Dashboard Issues

**Build Errors:**
- Check Node.js version (v16+)
- Clear node_modules and reinstall
- Verify all environment variables

### 🚀 Server Issues

**Database Connection:**
- Verify MongoDB Atlas credentials
- Check network access configuration
- Ensure IP address is whitelisted

**Port Issues:**
- Check if port 5000 is available
- Try different port in `.env`
- Verify firewall settings

## 📊 API Documentation

### Report Submission
```http
POST /api/reports
Content-Type: application/json

{
  "longitude": 73.8894519,
  "latitude": 18.4552165,
  "description": "High waves observed",
  "mediaUrl": "https://cloudinary-url.jpg",
  "hazardType": "High Waves",
  "submittedBy": "user@example.com"
}
```

### Get Reports
```http
GET /api/reports?role=analyst
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

### 📝 Development Guidelines
- Never commit `.env` files
- Update `.env.example` when adding new variables
- Follow existing code style
- Add comments for complex logic
- Test changes thoroughly

## 📄 License

This project is developed for **SIH 2025** by **Team 404 Founders**.

## 👥 Team

- **Team Name:** 404 Founders
- **Problem Statement:** SIH25039
- **Organization:** INCOIS (Indian National Centre for Ocean Information Services)

## 🆘 Support

For support or questions:
1. Check the troubleshooting section above
2. Review the `.env.example` files for configuration
3. Ensure all prerequisites are installed
4. Verify network connectivity between components

---

**🌊 Built with ❤️ for ocean safety and hazard monitoring**
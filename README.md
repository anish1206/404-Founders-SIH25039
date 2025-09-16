# SIH 2025 - Ocean Hazard Reporting Platform

## Project Structure
- `mobile-app/` - React Native/Expo mobile application
- `server/` - Node.js/Express backend API
- `dashboard/` - Web dashboard (future implementation)

## Security Notice
This project contains sensitive configuration files that should not be committed to version control:
- `.env` files contain API keys, database credentials, and other secrets
- Use the `.env.example` files as templates
- Never commit actual `.env` files to GitHub

## Setup Instructions

### Server Setup
1. Navigate to the server directory: `cd server`
2. Copy the environment template: `cp .env.example .env`
3. Fill in your actual MongoDB credentials and other config values
4. Install dependencies: `npm install`
5. Start the server: `npm start`

### Mobile App Setup
1. Navigate to the mobile-app directory: `cd mobile-app`
2. Copy the environment template: `cp .env.example .env`
3. Fill in your Firebase, Cloudinary, and API configuration
4. Install dependencies: `npm install`
5. Start the Expo development server: `npx expo start`

## Environment Variables Required

### Mobile App (.env)
- Firebase configuration (API key, project ID, etc.)
- Cloudinary configuration (cloud name, upload preset)
- API base URL (your server URL)

### Server (.env)
- MongoDB connection string
- Port configuration (optional)

## Security Best Practices
- All sensitive data is stored in `.env` files
- `.env` files are ignored by git
- Use `.env.example` files for sharing configuration structure
- Firebase API keys are public by design but should still be kept in env files
- MongoDB credentials contain actual passwords and should never be exposed

## Contributing
1. Never commit `.env` files
2. Update `.env.example` files when adding new environment variables
3. Ensure all secrets are properly configured before deployment
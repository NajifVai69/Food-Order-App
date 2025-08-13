# Food Order App - User Management & Authentication

A comprehensive food ordering application with advanced user management and authentication features.

## Features Implemented

### 🔐 User Management & Authentication
- **Three User Types**: Admin, Owner (Restaurant), Customer
- **Flexible Registration**: Phone number or email with password
- **Secure Login**: Phone/email + password with 'Remember Me' functionality
- **Auto-Verification**: Phone and email are automatically verified for development

### 👥 Profile Management
- **Customer Profiles**: Name, phone, delivery addresses, preferred language
- **Owner Profiles**: Restaurant details, menu items, pricing
- **Profile Updates**: Real-time profile information management

### 🎁 Referral System
- **Unique Referral Codes**: Automatically generated for each user
- **Referral Tracking**: Count referrals and manage rewards
- **Reward System**: Discounts and credits for successful referrals

### 🛡️ Account Security
- **Account Deactivation**: Temporary account suspension with reason tracking
- **Account Deletion**: Permanent account removal with password confirmation
- **Activity Logging**: Track login history, devices, and locations

### 📊 Activity Monitoring
- **Comprehensive Logs**: Login/logout, profile updates, account actions
- **Device Tracking**: Monitor devices and IP addresses
- **Security Alerts**: Track suspicious activity patterns

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cookie-based** session management

### Frontend
- **React.js** with functional components
- **React Router** for navigation
- **Context API** for state management
- **Tailwind CSS** for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a `.env` file in the backend directory with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/food-order-app
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/send-phone-otp` - Send phone OTP (optional)
- `POST /auth/send-email-otp` - Send email OTP (optional)
- `POST /auth/verify-phone-otp` - Verify phone OTP (optional)
- `POST /auth/verify-email-otp` - Verify email OTP (optional)

### User Management
- `GET /auth/activity-logs` - Get user activity logs
- `POST /auth/deactivate-account` - Deactivate account
- `POST /auth/delete-account` - Delete account permanently
- `GET /auth/referral-info` - Get referral information

### Profile Management
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /profile/addresses` - Add delivery address
- `PUT /profile/addresses/:id` - Update address
- `DELETE /profile/addresses/:id` - Delete address

## User Types & Permissions

### Customer
- Register and login
- Manage profile information
- Add/edit delivery addresses
- Set preferred language
- Use referral codes
- View activity logs
- Deactivate/delete account

### Restaurant Owner
- All customer features
- Manage restaurant information
- Add/edit menu items
- Set pricing
- Manage restaurant location

### Admin
- All owner features
- System-wide access
- User management capabilities

## Development Notes

### OTP System
- Currently uses mock OTP service for development
- OTPs are logged to console instead of being sent
- In production, integrate with actual SMS/Email services

### Security Features
- Passwords are hashed using bcryptjs
- JWT tokens stored in HttpOnly cookies
- Activity logging for security monitoring
- Account deactivation/deletion options

### Database Schema
- Comprehensive user model with embedded schemas
- Referral system with rewards tracking
- Activity logging with device information
- Flexible address and menu item management

## Future Enhancements

- Email/SMS service integration for OTP
- Two-factor authentication
- Social media login
- Advanced security features
- Push notifications
- Real-time activity monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.


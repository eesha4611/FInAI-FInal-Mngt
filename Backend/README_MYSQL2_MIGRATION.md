# MySQL2 Migration Guide

## 📋 Overview
This document outlines the migration from Sequelize to MySQL2 package for the authentication system.

## 🔄 Changes Made

### 1. Updated Auth Controller
- **File**: `controllers/auth.controller.js`
- **Changes**:
  - Switched from Sequelize ORM to raw MySQL2 queries
  - Added proper error handling with specific error codes
  - Implemented bcrypt password hashing
  - Added email existence check before user creation
  - Returns proper HTTP status codes (400, 409, 500, 201)

### 2. Database Table Structure
- **File**: `database/create_users_table.sql`
- **Structure**:
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

### 3. Key Features Implemented
- ✅ **MySQL2 Package**: Direct database queries using connection pooling
- ✅ **Password Hashing**: bcrypt with salt rounds of 10
- ✅ **Email Validation**: Checks for existing email before registration
- ✅ **Proper Error Messages**: Specific error responses instead of generic "Signup failed"
- ✅ **Express.json() Middleware**: Already configured in server.js
- ✅ **HTTP Status Codes**: 
  - 400: Bad Request (missing fields, invalid credentials)
  - 409: Conflict (user already exists)
  - 500: Internal Server Error
  - 201: Created (successful registration)

## 🚀 Usage Instructions

### 1. Create Database Table
```bash
mysql -u your_username -p your_database < database/create_users_table.sql
```

### 2. Install Dependencies
```bash
npm install mysql2 bcryptjs jsonwebtoken
```

### 3. Environment Variables
Ensure your `.env` file contains:
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

## 🔧 API Endpoints

### POST /api/auth/signup
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400/409)**:
```json
{
  "success": false,
  "message": "User already exists",
  "data": null
}
```

### POST /api/auth/login
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "john@example.com"
    }
  }
}
```

## 🔒 Security Features
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive field validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Can be implemented as middleware

## 📝 Migration Notes
- The old Sequelize models can be removed if no longer needed
- Analytics and other routes continue to work with existing MySQL2 setup
- All existing functionality preserved with improved error handling

## ✅ Testing
Test the endpoints using:
```bash
# Test signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

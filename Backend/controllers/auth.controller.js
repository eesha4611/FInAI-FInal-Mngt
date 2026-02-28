const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// =======================
// 🟢 SIGNUP (MySQL2 Version)
// =======================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check missing fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        data: null
      });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        data: null
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [name, email, hashedPassword]
    );

    // Get the inserted user ID
    const [newUser] = await db.query(
      'SELECT id, email FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific error messages
    let errorMessage = 'Registration failed';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'User already exists';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = 'Invalid data provided';
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      data: null
    });
  }
};

// =======================
// 🔵 LOGIN (MySQL2 Version)
// =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        data: null
      });
    }

    // Find user
    const [users] = await db.query(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      data: null
    });
  }
};

// =======================
// 🔴 LOGOUT
// =======================
exports.logout = (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
      data: null
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      data: null
    });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');


// =======================
// 🟢 SIGNUP
// =======================
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
        data: null
      });
    }

    // check if user exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        data: null
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Signup failed',
      data: null
    });
  }
};


// =======================
// 🔵 LOGIN
// =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
        data: null
      });
    }

    // find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
        data: null
      });
    }

    // generate token
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
// 🔴 LOGOUT (optional)
// =======================
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out',
    data: null
  });
};
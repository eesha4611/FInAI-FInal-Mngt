const db = require('../config/db');

// User related functions
const findUserByEmail = async (email) => {
  const connection = await db.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, email, password, created_at FROM users WHERE email = ?',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  } finally {
    connection.release();
  }
};

const createUser = async (email, hashedPassword) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return {
      id: result.insertId,
      email,
      createdAt: new Date().toISOString()
    };
  } finally {
    connection.release();
  }
};

// Transaction related functions
const createTransaction = async (userId, amount, type, category, description) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO transactions 
      (user_id, amount, type, category, description, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, amount, type, category, description]
    );

    return {
      id: result.insertId,
      userId,
      amount,
      type,
      category,
      description,
      createdAt: new Date().toISOString()
    };
  } finally {
    connection.release();
  }
};

const getUserTransactions = async (userId, filters = {}) => {
  try {
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;
    const offset = (page - 1) * limit;

    console.log("POOL DEBUG:", { userId, limit, offset });

    const query = `
      SELECT id, amount, type, category, description, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [Number(userId)]);

    return {
      transactions: rows,
      total: rows.length,
      page,
      totalPages: 1,
      limit
    };

  } catch (error) {
    console.error("POOL ERROR:", error);
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  createTransaction,
  getUserTransactions
};

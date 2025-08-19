const bcrypt = require('bcryptjs');
const { query, run, get } = require('../config/db');

class UserService {
  // Create new user
  async createUser(userData) {
    const { username, email, password, fullName, role = 'user' } = userData;
    
    // Check if user already exists
    const existingUser = await get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await run(
      'INSERT INTO users (username, email, password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [username, email, hashedPassword, fullName, role]
    );
    
    // Get the created user (without password)
    const newUser = await this.getUserById(result.id);
    return newUser;
  }
  
  // Get all users
  async getAllUsers() {
    const users = await query('SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC');
    return users;
  }
  
  // Get user by ID
  async getUserById(id) {
    const user = await get('SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?', [id]);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  
  // Update user
  async updateUser(id, updateData) {
    const { username, email, fullName, role } = updateData;
    
    // Check if user exists
    const existingUser = await this.getUserById(id);
    
    // Check if username or email already exists for other users
    if (username || email) {
      const duplicateUser = await get(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username, email, id]
      );
      if (duplicateUser) {
        throw new Error('Username or email already exists');
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (fullName) {
      updateFields.push('full_name = ?');
      updateValues.push(fullName);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    updateFields.push('updated_at = datetime("now")');
    updateValues.push(id);
    
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await run(sql, updateValues);
    
    return { message: 'User updated successfully' };
  }
  
  // Delete user
  async deleteUser(id) {
    // Check if user exists
    await this.getUserById(id);
    
    await run('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'User deleted successfully' };
  }
  
  // Get user by username or email (for authentication purposes)
  async getUserByUsernameOrEmail(usernameOrEmail) {
    const user = await get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );
    return user;
  }
  
  // Verify user password
  async verifyPassword(userId, password) {
    const user = await get('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  }
}

module.exports = new UserService(); 
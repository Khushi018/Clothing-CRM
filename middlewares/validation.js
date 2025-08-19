// Validation middleware for user operations

// Validate user creation
const validateCreateUser = (req, res, next) => {
  const { username, email, password, fullName } = req.body;
  
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['username', 'email', 'password', 'fullName'],
      received: { username, email, password: password ? '[HIDDEN]' : undefined, fullName }
    });
  }
  
  // Validate username format
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ 
      error: 'Username must be between 3 and 50 characters' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }
  
  // Validate fullName
  if (fullName.length < 2 || fullName.length > 100) {
    return res.status(400).json({ 
      error: 'Full name must be between 2 and 100 characters' 
    });
  }
  
  next();
};

// Validate user update
const validateUpdateUser = (req, res, next) => {
  const { username, email, fullName, role } = req.body;
  
  // Check if at least one field is provided
  if (!username && !email && !fullName && !role) {
    return res.status(400).json({ 
      error: 'At least one field must be provided for update' 
    });
  }
  
  // Validate username if provided
  if (username && (username.length < 3 || username.length > 50)) {
    return res.status(400).json({ 
      error: 'Username must be between 3 and 50 characters' 
    });
  }
  
  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
  }
  
  // Validate fullName if provided
  if (fullName && (fullName.length < 2 || fullName.length > 100)) {
    return res.status(400).json({ 
      error: 'Full name must be between 2 and 100 characters' 
    });
  }
  
  // Validate role if provided
  if (role && !['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ 
      error: 'Role must be one of: admin, manager, user' 
    });
  }
  
  next();
};

// Validate user ID parameter
const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({ 
      error: 'Invalid user ID. Must be a positive integer' 
    });
  }
  
  next();
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
}; 
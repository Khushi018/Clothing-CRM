const express = require('express');
const router = express.Router();

// Import user controller
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Import validation middleware
const {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
} = require('../middlewares/validation');

// User CRUD routes with validation
router.post('/', validateCreateUser, createUser);
router.get('/', getAllUsers);
router.get('/:id', validateUserId, getUserById);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.delete('/:id', validateUserId, deleteUser);

module.exports = router; 
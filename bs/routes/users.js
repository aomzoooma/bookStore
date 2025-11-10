const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const apiUrl = 'http://localhost:3000/api/users/login'; // Ensure this matches your user.js endpoint


// Authentication middleware
const authenticate = (req, res, next) => {
  // Implement authentication logic here
  // For example, check if a valid token is present in the request headers
  // If authentication fails, respond with a 401 Unauthorized status
  // Otherwise, proceed to the next middleware or route handler
  next();
};

// Authorization middleware
const authorize = (requiredRole) => (req, res, next) => {
  // Implement authorization logic here
  // For example, check if the authenticated user has the required role
  // If authorization fails, respond with a 403 Forbidden status
  // Otherwise, proceed to the next middleware or route handler
  next();
};

// POST login
router.post('/users/login', [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
// Simulate checking the database for the user
const user = await getUserFromDatabase(email);

if (!user) {
  // User not found
  return res.status(401).json({ error: 'Invalid credentials' });
}

// Simulate checking if the password matches (in a real app, you'd hash the stored password)
if (user.password !== password) {
  // Incorrect password
  return res.status(401).json({ error: 'Invalid credentials' });
}

// If you reach here, the user is authenticated
res.json({ message: 'Login successful' });
});
// GET all users
router.get('/users', authenticate, (req, res) => {
  const sql = 'SELECT * FROM users';
  req.db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});
// Simulate fetching a user from the database based on email
async function getUserFromDatabase(email) {
  // This is where you would make a database query to find the user by email
  // For example, using your req.db.query method
  const sql = 'SELECT * FROM users WHERE email = ?';
  return new Promise((resolve, reject) => {
    req.db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Error fetching user from database:', err);
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// GET user by ID
router.get('/users/:id', authenticate, (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE user_id = ?';
  req.db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results[0]);
  });
});

// CREATE a new user (signup)
router.post('/users/signup', [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isString().isLength({ min: 6 }), // Example: Password must be at least 6 characters
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  // Add other validation rules as needed
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract user data from the request body
  const { email, password } = req.body;

  // TODO: Implement user creation logic in your database
  // Use the same connection as in server.js via req.db

  res.json({ message: 'User signed up successfully' });
});
/// UPDATE user by ID
router.put('/users/:id', authenticate, [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isString().isLength({ min: 6 }), // Example: Password must be at least 6 characters
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Update the user in the database
  // ...

  res.json({ message: 'User updated successfully' });
});

// DELETE user by ID
router.delete('/users/:id', authenticate, authorize('admin'), (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE user_id = ?';
  req.db.query(sql, [userId], (err) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'User deleted successfully', id: userId });
  });
});

module.exports = router;

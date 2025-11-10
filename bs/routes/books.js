const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

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

// GET all books
router.get('/books', authenticate, (req, res) => {
  const sql = 'SELECT * FROM books';
  req.db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

// GET book by ID
router.get('/books/:id', authenticate, (req, res) => {
  const bookId = req.params.id;
  const sql = 'SELECT * FROM books WHERE book_id = ?';
  req.db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results[0]);
  });
});

// CREATE a new book
router.post('/books', authenticate, [
  body('title').notEmpty().isString(),
  body('price').notEmpty().isNumeric(),
  body('genre').notEmpty().isString(),
  body('admin_id').notEmpty().isNumeric(),
  body('author_id').notEmpty().isNumeric(),
  body('publisher_id').notEmpty().isNumeric(),
  // Add other validation rules as needed
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, price, genre, admin_id, author_id, publisher_id } = req.body;
  const sql = `
    INSERT INTO books (title, price, genre, admin_id, author_id, publisher_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  req.db.query(
    sql,
    [title, price, genre, admin_id, author_id, publisher_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Internal Server Error' });
      res.status(201).json({ id: result.insertId, message: 'Book added successfully' });
    }
  );
});

// UPDATE book by ID
router.put('/books/:id', authenticate, authorize('admin'), [
  body('title').notEmpty().isString(),
  body('price').notEmpty().isNumeric(),
  body('genre').notEmpty().isString(),
  body('admin_id').notEmpty().isNumeric(),
  body('author_id').notEmpty().isNumeric(),
  body('publisher_id').notEmpty().isNumeric(),
  // Add other validation rules as needed
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { title, price, genre, admin_id, author_id, publisher_id } = req.body;

  const sql = `
    UPDATE books
    SET title = ?, price = ?, genre = ?, admin_id = ?, author_id = ?, publisher_id = ?
    WHERE book_id = ?
  `;

  req.db.query(
    sql,
    [title, price, genre, admin_id, author_id, publisher_id, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Internal Server Error' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.json({ message: 'Book updated successfully' });
    }
  );
});
// DELETE book by ID
router.delete('/books/:id', authenticate, authorize('admin'), (req, res) => {
  const bookId = req.params.id;
  const sql = 'DELETE FROM books WHERE book_id = ?';
  req.db.query(sql, [bookId], (err) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Book deleted successfully', id: bookId });
  });
});

module.exports = router;

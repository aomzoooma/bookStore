const express = require('express');
const router = express.Router();

// GET all orders
router.get('/orders', (req, res) => {
  const sql = 'SELECT * FROM orders';
  req.db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

// GET order by ID
router.get('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const sql = 'SELECT * FROM orders WHERE order_id = ?';
  req.db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results[0]);
  });
});

// CREATE a new order
router.post('/orders', (req, res) => {
  const { order_date, order_amount, user_id } = req.body;
  const sql = 'INSERT INTO orders (order_date, order_amount, user_id) VALUES (?, ?, ?)';
  req.db.query(sql, [order_date, order_amount, user_id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Order added successfully', id: result.insertId });
  });
});

// UPDATE order by ID
router.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { order_date, order_amount, user_id } = req.body;
  const sql = 'UPDATE orders SET order_date = ?, order_amount = ?, user_id = ? WHERE order_id = ?';
  req.db.query(sql, [order_date, order_amount, user_id, orderId], (err) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Order updated successfully', id: orderId });
  });
});

// DELETE order by ID
router.delete('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const sql = 'DELETE FROM orders WHERE order_id = ?';
  req.db.query(sql, [orderId], (err) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Order deleted successfully', id: orderId });
  });
});

module.exports = router;

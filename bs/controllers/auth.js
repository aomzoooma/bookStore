const mysql = require('mysql');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bookstore",
});

exports.signup = (req, res) => {
  console.log(req.body);

  const { name, email, password, confirmPassword } = req.body;

  // Check if the email already exists
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      return res.render('signup', {
        message: 'That email is already in use',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render('signup', {
        message: 'Password confirmation does not match password',
      });
    }

    // If email is not in use and passwords match, proceed with user creation
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Successfully inserted the new user
      res.json({ message: 'User signed up successfully' });
    });

    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);
  });
};

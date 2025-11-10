const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const exphbs = require('express-handlebars');
const { authenticate, authorize } = require('./bs/authMiddleware');
const userRoutes = require('./bs/routes/users');
const bookRoutes = require('./bs/routes/books');
const authorRoutes = require('./bs/routes/authors');
const publisherRoutes = require('./bs/routes/publishers');
const orderRoutes = require('./bs/routes/orders');

dotenv.config({ path: './.env' });

const app = express();
const port = 3000;

// Set up Handlebars as the view engine
const publicDirectory = path.join(path.join(__dirname, './css'));
app.use(express.static(publicDirectory));
app.set('view engine', 'hbs');


const corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bookstore',
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
app.use((req, res, next) => {
  req.db = db;
  next();
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//app.use(bodyParser.json());

app.use(authenticate);
app.use('/api/admin', authorize('admin'));

app.use(express.static(path.join(__dirname, './css')));

app.use('/api', userRoutes);
app.use('/api', bookRoutes);
app.use('/api', authorRoutes);
app.use('/api', publisherRoutes);
app.use('/api', orderRoutes);

app.use('/', require('./bs/routes/pages'));
app.use('/auth', authenticate, require('./bs/routes/auth'));

app.use((err, req, res, next) => {
  console.error(err);              // log for yourself
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server error',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

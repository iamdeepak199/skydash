const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const authenticateToken = require('../middleware/auth'); // Adjust the path as needed
const upload = require('../middleware/upload'); // Adjust the path as needed

// Create a connection pool to the MySQL database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'Admin3'
});

// Display home page
router.get('/', (req, res) => {
  res.render('home'); // Assuming home.ejs is in your views folder
});

// Display registration form
router.get('/register', (req, res) => {
  res.render('register'); // Assuming register.ejs is in your views folder
});

// Handle registration form submission
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists in the database
    const [existingAdmin] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (existingAdmin.length > 0) {
      return res.render('register', { errorMessage: 'Email already exists' });
    }

    // Validate the password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.render('register', { errorMessage: 'Password must be at least 6 characters long and contain at least one uppercase and one lowercase letter' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin into the database
    const query = 'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)';
    await db.execute(query, [name, email, hashedPassword]);

    console.log('Admin registered successfully');
    res.redirect('/login');
  } catch (error) {
    console.error('Error registering admin:', error);
    res.render('register', { errorMessage: 'Server error' });
  }
});

// Display login form
router.get('/login', (req, res) => {
  res.render('login'); // Assuming login.ejs is in your views folder
});

// Handle login form submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists in the database
    const [adminRows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    const admin = adminRows[0];
    if (!admin) {
      return res.render('login', { errorMessage: 'Admin not found' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.render('login', { errorMessage: 'Invalid password' });
    }

    // Issue JWT token
    const payload = {
      admin: {
        id: admin.id
      }
    };

    const jwtSecret = process.env.JWT_SECRET || "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";
    jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true }); // Set cookie with JWT token
      res.redirect('/dashboard');
    });

  } catch (error) {
    console.error('Error logging in admin:', error);
    res.render('login', { errorMessage: 'Server error' });
  }
});

// Display dashboard after login
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [adminRows] = await db.execute('SELECT id, name, email FROM admins WHERE id = ?', [req.admin.id]);
    const admin = adminRows[0];

    if (!admin) {
      return res.status(404).send('Admin not found');
    }

    res.render('dashboard', { admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).send('Server error');
  }
});

// Display profile page
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [adminRows] = await db.execute('SELECT id, name, email, bio, picture FROM admins WHERE id = ?', [req.admin.id]);
    const admin = adminRows[0];

    if (!admin) {
      return res.status(404).send('Admin not found');
    }

    res.render('profile', { admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).send('Server error');
  }
});

// POST route to handle profile updates
router.post('/profile', authenticateToken, upload.single('picture'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const picture = req.file ? '/images/' + req.file.filename : null;

    const query = 'UPDATE admins SET name = ?, bio = ?, picture = ? WHERE id = ?';
    await db.execute(query, [name, bio, picture, req.admin.id]);

    res.render('profile', { successMessage: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).send('Server error');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.redirect('/login'); // Redirect to login page after logout
});

module.exports = router;

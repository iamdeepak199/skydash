const express = require('express');
const mysql = require('mysql2/promise'); // MySQL connection using mysql2
const routes = require('./routes/routes'); // Import your routes
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Set the static folder

app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookieParser()); // Use cookie-parser middleware

// Routes
app.use('/', routes); // Mount your routes

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

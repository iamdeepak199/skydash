const mysql = require('mysql2/promise');

// Create a MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',     // Replace with your MySQL username
  password: '12345', // Replace with your MySQL password
  database: 'Admin3'  // Replace with your MySQL database name
});

// Connect to MySQL Database
async function connectToDatabase() {
  try {
    await db.getConnection();
    console.log('Connected successfully to MySQL');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
  }
}

// Function to add an admin to the MySQL database
async function addAdmin(name, email, password, picture, bio) {
  try {
    const query = `
      INSERT INTO admins (name, email, password, picture, bio)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Execute the query and insert the admin data into the "admins" table
    const [result] = await db.execute(query, [name, email, password, picture, bio]);

    if (result.affectedRows > 0) {
      console.log('Admin saved successfully');
    } else {
      console.error('Failed to save admin');
    }
  } catch (err) {
    console.error('Error saving admin:', err);
    throw err; // Propagate the error
  }
}

// Example usage (if needed):
// addAdmin('John Doe', 'john@example.com', 'hashed_password', 'image_url', 'Admin Bio');

module.exports = addAdmin;
connectToDatabase();

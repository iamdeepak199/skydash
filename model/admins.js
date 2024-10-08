const mysql = require('mysql2/promise');

// Create a connection pool to the MySQL database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',     // Replace with your MySQL username
  password: '12345', // Replace with your MySQL password
  database: 'Admin3'  // Replace with your MySQL database name
});

// Function to add a new admin
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
    throw err;
  }
}

// Function to find an admin by email
async function findAdminByEmail(email) {
  try {
    const query = `SELECT * FROM admins WHERE email = ?`;
    const [rows] = await db.execute(query, [email]);

    if (rows.length > 0) {
      return rows[0]; // Return the found admin
    } else {
      console.log('Admin not found');
      return null;
    }
  } catch (err) {
    console.error('Error finding admin:', err);
    throw err;
  }
}

// Export the functions to use them in other parts of the application
module.exports = { addAdmin, findAdminByEmail };

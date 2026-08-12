const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs'); 
const pool = require('../config/db'); 


//REGISTRATION
router.post('/register', (req, res) => {
  const { name, email, password, contact_info } = req.body;

  if (!name || !email || !password || !contact_info) {  //if a user doesn't enter all values
    return res.json({ error: 'Please provide all required credentials' });
  }

  try { //if a user enters an existing email
    const [existing] = pool.query('SELECT patient_id FROM Patient WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = bcrypt.hash(password, 10); //this hashes the password 

    const [result] = pool.query( //this updates the database with a new account
      'INSERT INTO Patient (name, contact_info, email, password) VALUES (?, ?, ?, ?)',
      [name, contact_info, email, hashedPassword]);

    res.json({ patient_id: result.insertId, name, email });
  } 
  
  catch (err) { //error handling
    console.error(err);
    res.json({ error: 'Registration failed' });
  }
});


// LOG IN 
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { //user didn't enter all values
    return res.json({ error: 'Email and password are required' });
  }

  try { //check if the email exists in the db
    const [rows] = pool.query('SELECT * FROM Patient WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ error: 'Incorrect email or password' });
    }

    const patient = rows[0];
    const passwordMatches = bcrypt.compare(password, patient.password); //compare the entered password with the encrypted db one

    if (!passwordMatches) {
      return res.json({ error: 'Incorrect email or password' }); //return error if password doesn't match 
    }
  }
  
  catch (err) {
    console.error(err);
    res.json({ error: 'Login failed' });
  }
});

//RESET PASSWORD
router.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.json({ error: 'email and new password are required' });
  }

  try {
    const [rows] = pool.query('SELECT patient_id FROM Patient WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ error: 'No account with that email' });
    }

    const hashedPassword = bcrypt.hash(newPassword, 10);
    pool.query('UPDATE Patient SET password = ? WHERE email = ?', [hashedPassword, email]);

    res.json({ message: 'Password updated' });
  } 
  
  catch (err) {
    console.error(err);
    res.json({ error: 'Password reset failed' });
  }
});

module.exports = router; //makes the file available for other files to import 

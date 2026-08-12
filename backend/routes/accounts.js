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

module.exports = router; //makes the file available for other files to import 

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    contactInfo
  } = req.body;

  if (!name || !email || !password || !contactInfo) {
    return res.status(400).json({
      message: 'Name, email, password, and contact info are required.'
    });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedContactInfo = contactInfo.trim();

  if (!trimmedName) {
    return res.status(400).json({
      message: 'Please enter your name.'
    });
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return res.status(400).json({
      message: 'Please enter a valid email address.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long.'
    });
  }

  if (!trimmedContactInfo) {
    return res.status(400).json({
      message: 'Please enter your contact information.'
    });
  }

  try {
    const [patientRows] = await pool.query(
      'SELECT patient_id FROM Patient WHERE email = ?',
      [trimmedEmail]
    );

    if (patientRows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const [staffRows] = await pool.query(
      'SELECT staff_id FROM Staff WHERE email = ?',
      [trimmedEmail]
    );

    if (staffRows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO Patient
       (name, contact_info, medical_record, email, password)
       VALUES (?, ?, NULL, ?, ?)`,
      [
        trimmedName,
        trimmedContactInfo,
        trimmedEmail,
        hashedPassword
      ]
    );

    return res.status(201).json({
      message: 'Registration successful.',
      patient_id: result.insertId
    });

  } catch (err) {
    console.error('Registration error:', err);

    return res.status(500).json({
      message: 'Registration failed. Please try again.'
    });
  }
});


router.post('/login', async (req, res) => {
  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required.'
    });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {


    const [staffRows] = await pool.query(
      'SELECT * FROM Staff WHERE email = ?',
      [trimmedEmail]
    );

    if (staffRows.length > 0) {
      const staff = staffRows[0];

      const passwordMatches = await bcrypt.compare(
        password,
        staff.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: 'Incorrect email or password.'
        });
      }

      return res.json({
        message: 'Login successful.',
        userType: 'staff',
        staff_id: staff.staff_id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      });
    }


    const [patientRows] = await pool.query(
      'SELECT * FROM Patient WHERE email = ?',
      [trimmedEmail]
    );

    if (patientRows.length > 0) {
      const patient = patientRows[0];

      const passwordMatches = await bcrypt.compare(
        password,
        patient.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: 'Incorrect email or password.'
        });
      }

      return res.json({
        message: 'Login successful.',
        userType: 'patient',
        patient_id: patient.patient_id,
        name: patient.name,
        email: patient.email
      });
    }


    return res.status(401).json({
      error: 'Incorrect email or password.'
    });

  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  try {

    // First check Staff
    const [staffRows] = await pool.query(
      'SELECT * FROM Staff WHERE email = ?',
      [email]
    );

    if (staffRows.length > 0) {
      const staff = staffRows[0];

      const passwordMatches = await bcrypt.compare(
        password,
        staff.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: 'Incorrect email or password'
        });
      }

      return res.json({
        message: 'Login successful',
        userType: 'staff',
        staff_id: staff.staff_id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      });
    }


    // If not Staff, check Patient
    const [patientRows] = await pool.query(
      'SELECT * FROM Patient WHERE email = ?',
      [email]
    );

    if (patientRows.length > 0) {
      const patient = patientRows[0];

      const passwordMatches = await bcrypt.compare(
        password,
        patient.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: 'Incorrect email or password'
        });
      }

      return res.json({
        message: 'Login successful',
        userType: 'patient',
        patient_id: patient.patient_id,
        name: patient.name,
        email: patient.email
      });
    }


    // No account found
    return res.status(401).json({
      error: 'Incorrect email or password'
    });

  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      error: 'Login failed'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT prescription.prescription_id, prescription.diagnosis, prescription.medication,
              prescription.instructions, staff.name AS doctor_name
       FROM prescription
       JOIN doctor ON prescription.doctor_id = doctor.doctor_id
       JOIN staff ON doctor.staff_id = staff.staff_id
       WHERE prescription.patient_id = ?
       ORDER BY prescription.prescription_id DESC`,
      [req.params.patientId]
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load prescriptions.' });
  }
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, diagnosis, medication, instructions } = req.body;

  if (!patient_id || !doctor_id || !diagnosis || !medication) {
    return res.status(400).json({ message: 'patient_id, doctor_id, diagnosis, and medication are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO prescription (patient_id, doctor_id, diagnosis, medication, instructions)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, diagnosis, medication, instructions || '']
    );
    res.status(201).json({ prescription_id: result.insertId });
  }
  
  catch (err) {
    res.status(500).json({ message: 'Could not issue prescription.' });
  }
});

module.exports = router;
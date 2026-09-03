const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Prescription.prescription_id,
         Prescription.diagnosis,
         Prescription.medication,
         Prescription.instructions,
         Staff.name AS doctor_name
       FROM Prescription
       JOIN Doctor
         ON Prescription.doctor_id = Doctor.doctor_id
       JOIN Staff
         ON Doctor.staff_id = Staff.staff_id
       WHERE Prescription.patient_id = ?
       ORDER BY Prescription.prescription_id DESC`,
      [req.params.patientId]
    );

    res.json(rows);
  } 
  
  catch (err) {
    console.error('GET /api/prescriptions/patient error:', err);

    res.status(500).json({
      message: 'Could not load prescriptions.'
    });
  }
});

router.post('/', async (req, res) => {
  const {
    patient_id,
    doctor_id,
    diagnosis,
    medication,
    instructions
  } = req.body;

  if (!patient_id || !doctor_id || !diagnosis || !medication) {
    return res.status(400).json({
      message: 'patient_id, doctor_id, diagnosis, and medication are required.'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Prescription
       (patient_id, doctor_id, diagnosis, medication, instructions)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patient_id,
        doctor_id,
        diagnosis,
        medication,
        instructions || ''
      ]
    );

    res.status(201).json({
      prescription_id: result.insertId,
      message: 'Prescription issued successfully.'
    });
  } 
  
  catch (err) {
    console.error('POST /api/prescriptions error:', err);

    res.status(500).json({
      message: 'Could not issue prescription.'
    });
  }
});

module.exports = router;
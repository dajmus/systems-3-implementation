const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
  const { patient_id, slot_id, doctor_id, staff_id } = req.body;

  if (!patient_id || !slot_id || !doctor_id || !staff_id) {
    return res.status(400).json({ message: 'patient_id, slot_id, doctor_id, and staff_id are required.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [slotRows] = await connection.query(
      `SELECT date_and_time, slot_status FROM schedule WHERE slot_id = ? FOR UPDATE`,
      [slot_id]
    );

    if (slotRows.length === 0 || slotRows[0].slot_status !== 'available') {
      await connection.rollback();
      return res.status(400).json({ message: 'This slot is no longer available.' });
    }

    const [result] = await connection.query(
      `INSERT INTO appointment (patient_id, doctor_id, staff_id, date_and_time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [patient_id, doctor_id, staff_id, slotRows[0].date_and_time]
    );

    await connection.query(
      `UPDATE schedule SET appointment_id = ?, slot_status = 'occupied' WHERE slot_id = ?`,
      [result.insertId, slot_id]
    );

    await connection.commit();
    res.status(201).json({ appointment_id: result.insertId });
  } 
  
  catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Could not book appointment.' });
  } 
  
  finally {
    connection.release();
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT appointment.appointment_id, appointment.date_and_time, appointment.status,
              staff.name AS doctor_name
       FROM appointment
       JOIN doctor ON appointment.doctor_id = doctor.doctor_id
       JOIN staff ON doctor.staff_id = staff.staff_id
       WHERE appointment.patient_id = ?
       ORDER BY appointment.date_and_time`,
      [req.params.patientId]
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load appointments.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT appointment.appointment_id, appointment.date_and_time, appointment.status,
              patient.name AS patient_name, staff.name AS doctor_name
       FROM appointment
       JOIN patient ON appointment.patient_id = patient.patient_id
       JOIN doctor ON appointment.doctor_id = doctor.doctor_id
       JOIN staff ON doctor.staff_id = staff.staff_id
       ORDER BY appointment.date_and_time`
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load appointments.' });
  }
});

router.put('/:id/cancel', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE appointment SET status = 'cancelled' WHERE appointment_id = ?`,
      [req.params.id]
    );

    await connection.query(
      `UPDATE schedule SET appointment_id = NULL, slot_status = 'available' WHERE appointment_id = ?`,
      [req.params.id]
    );

    await connection.commit();
    res.json({ message: 'Appointment cancelled.' });
  } 
  
  catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Could not cancel appointment.' });
  } 
  
  finally {
    connection.release();
  }
});

module.exports = router;
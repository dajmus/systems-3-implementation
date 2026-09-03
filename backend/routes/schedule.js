const express = require('express');
const router = express.Router();
const pool = require('../config/db');


// GET available appointment slots
router.get('/available', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Schedule.slot_id,
         Schedule.date_and_time,
         Schedule.staff_id,
         Doctor.doctor_id,
         Staff.name AS staff_name
       FROM Schedule
       JOIN Staff
         ON Schedule.staff_id = Staff.staff_id
       JOIN Doctor
         ON Doctor.staff_id = Schedule.staff_id
       WHERE Schedule.slot_status = 'available'
       ORDER BY Schedule.date_and_time`
    );

    res.json(rows);

  } catch (err) {
    console.error('GET /api/schedule/available error:', err);

    res.status(500).json({
      message: 'Could not load schedule.'
    });
  }
});


// CREATE a new available schedule slot
router.post('/', async (req, res) => {
  const { staff_id, date_and_time } = req.body;

  if (!staff_id || !date_and_time) {
    return res.status(400).json({
      message: 'staff_id and date_and_time are required.'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Schedule
       (staff_id, date_and_time, slot_status)
       VALUES (?, ?, 'available')`,
      [staff_id, date_and_time]
    );

    res.status(201).json({
      slot_id: result.insertId,
      message: 'Schedule slot created.'
    });

  } catch (err) {
    console.error('POST /api/schedule error:', err);

    res.status(500).json({
      message: 'Could not create slot.'
    });
  }
});


// DELETE an available schedule slot
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM Schedule
       WHERE slot_id = ?
       AND slot_status = 'available'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: 'Slot not found or already booked.'
      });
    }

    res.json({
      message: 'Slot removed.'
    });

  } catch (err) {
    console.error('DELETE /api/schedule/:id error:', err);

    res.status(500).json({
      message: 'Could not remove slot.'
    });
  }
});


module.exports = router;
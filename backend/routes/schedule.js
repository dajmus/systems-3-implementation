const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/available', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT schedule.slot_id, schedule.date_and_time, schedule.staff_id, doctor.doctor_id, staff.name AS staff_name
       FROM schedule
       JOIN staff ON schedule.staff_id = staff.staff_id
       JOIN doctor ON doctor.staff_id = schedule.staff_id
       WHERE schedule.slot_status = 'available'
       ORDER BY schedule.date_and_time`
    );
    res.json(rows);
  }
  
  catch (err) {
    res.status(500).json({ message: 'Could not load schedule.' });
  }
});

router.post('/', async (req, res) => {
  const { staff_id, date_and_time } = req.body;

  if (!staff_id || !date_and_time) {
    return res.status(400).json({ message: 'staff_id and date_and_time are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO schedule (staff_id, date_and_time, slot_status) VALUES (?, ?, 'available')`,
      [staff_id, date_and_time]
    );
    res.status(201).json({ slot_id: result.insertId });
  }
  
  catch (err) {
    res.status(500).json({ message: 'Could not create slot.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM schedule WHERE slot_id = ? AND slot_status = 'available'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Slot not found or already booked.' });
    }

    res.json({ message: 'Slot removed.' });
  }
  
  catch (err) {
    res.status(500).json({ message: 'Could not remove slot.' });
  }
});

module.exports = router;
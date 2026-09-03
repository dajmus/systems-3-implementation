const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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

router.post('/', async (req, res) => {
  const { staff_id, date, start_time, end_time } = req.body;

  if (!staff_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      message: 'staff_id, date, start_time, and end_time are required.'
    });
  }

  const start = new Date(`${date}T${start_time}:00`);
  const end = new Date(`${date}T${end_time}:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({
      message: 'Invalid date or time.'
    });
  }

  if (end <= start) {
    return res.status(400).json({
      message: 'End time must be after start time.'
    });
  }

  const slots = [];
  const current = new Date(start);

  while (current < end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const hours = String(current.getHours()).padStart(2, '0');
    const minutes = String(current.getMinutes()).padStart(2, '0');

    slots.push(`${year}-${month}-${day} ${hours}:${minutes}:00`);
    current.setMinutes(current.getMinutes() + 30);
  }

  try {
    const [existingRows] = await pool.query(
      `SELECT date_and_time
       FROM Schedule
       WHERE staff_id = ?
       AND date_and_time >= ?
       AND date_and_time < ?`,
      [
        staff_id,
        `${date} ${start_time}:00`,
        `${date} ${end_time}:00`
      ]
    );

    const existingTimes = new Set(
      existingRows.map((row) => {
        const value = new Date(row.date_and_time);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
      })
    );

    const newSlots = slots.filter((slot) => !existingTimes.has(slot));

    if (newSlots.length === 0) {
      return res.status(400).json({
        message: 'All slots in this time range already exist.'
      });
    }

    const values = newSlots.map((slot) => [
      staff_id,
      slot,
      'available'
    ]);

    await pool.query(
      `INSERT INTO Schedule
       (staff_id, date_and_time, slot_status)
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      message: `${newSlots.length} appointment slots created.`,
      slots_created: newSlots.length
    });
  } catch (err) {
    console.error('POST /api/schedule error:', err);
    res.status(500).json({
      message: 'Could not create slots.'
    });
  }
});

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
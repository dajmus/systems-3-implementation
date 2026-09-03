const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Catalog.catalog_id,
         Catalog.doctor_id,
         Catalog.staff_id,
         Catalog.modality,
         Catalog.price,
         Staff.name AS doctor_name
       FROM Catalog
       JOIN Doctor
         ON Catalog.doctor_id = Doctor.doctor_id
       JOIN Staff
         ON Doctor.staff_id = Staff.staff_id
       ORDER BY Catalog.modality`
    );

    res.json(rows);

  } catch (err) {
    console.error('GET /api/catalog error:', err);

    res.status(500).json({
      message: 'Could not load catalog.'
    });
  }
});


router.get('/doctors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Doctor.doctor_id,
         Doctor.staff_id,
         Staff.name
       FROM Doctor
       JOIN Staff
         ON Doctor.staff_id = Staff.staff_id
       ORDER BY Staff.name`
    );

    res.json(rows);

  } catch (err) {
    console.error('GET /api/catalog/doctors error:', err);

    res.status(500).json({
      message: 'Could not load doctors.'
    });
  }
});


router.post('/', async (req, res) => {
  const {
    doctor_id,
    staff_id,
    modality,
    price
  } = req.body;

  if (
    !doctor_id ||
    !staff_id ||
    !modality ||
    price === undefined ||
    price === null ||
    price === ''
  ) {
    return res.status(400).json({
      message:
        'doctor_id, staff_id, modality, and price are required.'
    });
  }

  if (Number(price) < 0) {
    return res.status(400).json({
      message: 'Price cannot be negative.'
    });
  }

  try {
    const [doctorRows] = await pool.query(
      `SELECT doctor_id
       FROM Doctor
       WHERE doctor_id = ?
         AND staff_id = ?`,
      [doctor_id, staff_id]
    );

    if (doctorRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid doctor.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Catalog
       (doctor_id, staff_id, modality, price)
       VALUES (?, ?, ?, ?)`,
      [
        doctor_id,
        staff_id,
        modality.trim(),
        price
      ]
    );

    res.status(201).json({
      catalog_id: result.insertId
    });

  } catch (err) {
    console.error('POST /api/catalog error:', err);

    res.status(500).json({
      message: 'Could not add service.'
    });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM Catalog
       WHERE catalog_id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Service not found.'
      });
    }

    res.json({
      message: 'Service removed.'
    });

  } catch (err) {
    console.error(
      'DELETE /api/catalog/:id error:',
      err
    );

    res.status(500).json({
      message: 'Could not remove service.'
    });
  }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT catalog.catalog_id, catalog.modality, catalog.price, staff.name AS doctor_name
       FROM catalog
       JOIN doctor ON catalog.doctor_id = doctor.doctor_id
       JOIN staff ON doctor.staff_id = staff.staff_id
       ORDER BY catalog.modality`
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load catalog.' });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT doctor.doctor_id, staff.name
       FROM doctor
       JOIN staff ON doctor.staff_id = staff.staff_id`
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load doctors.' });
  }
});

router.post('/', async (req, res) => {
  const { doctor_id, staff_id, modality, price } = req.body;

  if (!doctor_id || !staff_id || !modality || !price) {
    return res.status(400).json({ message: 'doctor_id, staff_id, modality, and price are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO catalog (doctor_id, staff_id, modality, price) VALUES (?, ?, ?, ?)`,
      [doctor_id, staff_id, modality, price]
    );
    res.status(201).json({ catalog_id: result.insertId });
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not add service.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM catalog WHERE catalog_id = ?`, [req.params.id]);
    res.json({ message: 'Service removed.' });
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not remove service.' });
  }
});

module.exports = router;
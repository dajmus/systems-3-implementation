const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bill_id, amount, payment_date, payment_method, status
       FROM bill
       WHERE patient_id = ?
       ORDER BY bill_id DESC`,
      [req.params.patientId]
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load bills.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bill.bill_id, bill.amount, bill.status, patient.name AS patient_name
       FROM bill
       JOIN patient ON bill.patient_id = patient.patient_id
       ORDER BY bill.bill_id DESC`
    );
    res.json(rows);
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not load bills.' });
  }
});

router.post('/', async (req, res) => {
  const { patient_id, amount } = req.body;

  if (!patient_id || !amount) {
    return res.status(400).json({ message: 'patient_id and amount are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO bill (patient_id, amount, status) VALUES (?, ?, 'unpaid')`,
      [patient_id, amount]
    );
    res.status(201).json({ bill_id: result.insertId });
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not create bill.' });
  }
});

router.put('/:id/pay', async (req, res) => {
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: 'payment_method is required.' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE bill SET status = 'paid', payment_method = ?, payment_date = CURDATE()
       WHERE bill_id = ? AND status = 'unpaid'`,
      [payment_method, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Bill not found or already paid.' });
    }

    res.json({ message: 'Payment recorded.' });
  } 
  
  catch (err) {
    res.status(500).json({ message: 'Could not process payment.' });
  }
});

module.exports = router;
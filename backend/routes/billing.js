const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Bill.bill_id,
         Bill.amount,
         Bill.payment_date,
         Bill.payment_method,
         Bill.status
       FROM Bill
       WHERE Bill.patient_id = ?
       ORDER BY Bill.bill_id DESC`,
      [req.params.patientId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /api/billing/patient error:', err);

    res.status(500).json({
      message: 'Could not load bills.'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Bill.bill_id,
         Bill.amount,
         Bill.status,
         Patient.name AS patient_name
       FROM Bill
       JOIN Patient
         ON Bill.patient_id = Patient.patient_id
       ORDER BY Bill.bill_id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /api/billing error:', err);

    res.status(500).json({
      message: 'Could not load bills.'
    });
  }
});

router.post('/', async (req, res) => {
  const { patient_id, amount } = req.body;

  if (!patient_id || !amount) {
    return res.status(400).json({
      message: 'patient_id and amount are required.'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Bill
       (patient_id, amount, status)
       VALUES (?, ?, 'unpaid')`,
      [patient_id, amount]
    );

    res.status(201).json({
      bill_id: result.insertId,
      message: 'Bill created successfully.'
    });
  } catch (err) {
    console.error('POST /api/billing error:', err);

    res.status(500).json({
      message: 'Could not create bill.'
    });
  }
});

router.put('/:id/pay', async (req, res) => {
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({
      message: 'payment_method is required.'
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Bill
       SET status = 'paid',
           payment_method = ?,
           payment_date = CURDATE()
       WHERE bill_id = ?
       AND status = 'unpaid'`,
      [payment_method, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: 'Bill not found or already paid.'
      });
    }

    res.json({
      message: 'Payment recorded.'
    });
  } catch (err) {
    console.error('PUT /api/billing/:id/pay error:', err);

    res.status(500).json({
      message: 'Could not process payment.'
    });
  }
});

module.exports = router;
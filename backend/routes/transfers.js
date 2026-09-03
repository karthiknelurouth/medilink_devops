const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM transfers ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

router.post('/', (req, res) => {
  const { patient_name, age, gender, condition_name, from_hospital, to_hospital, urgency, notes } = req.body;
  const sql = `INSERT INTO transfers (patient_name, age, gender, condition_name, from_hospital, to_hospital, urgency, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [patient_name, age || null, gender || null, condition_name, from_hospital, to_hospital, urgency || 'Normal', notes || ''], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Transfer request created' });
  });
});

router.patch('/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE transfers SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transfer status updated' });
  });
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM transfers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transfer deleted' });
  });
});

module.exports = router;
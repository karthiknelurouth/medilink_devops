const db = require('../config/db');

const getTransfers = (req, res) => {
  db.query('SELECT * FROM transfers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

const addTransfer = (req, res) => {
  const { item_name, from_hospital, to_hospital, quantity } = req.body;
  const sql = 'INSERT INTO transfers (item_name, from_hospital, to_hospital, quantity) VALUES (?, ?, ?, ?)';
  db.query(sql, [item_name, from_hospital, to_hospital, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Transfer added successfully' });
  });
};

module.exports = { getTransfers, addTransfer };
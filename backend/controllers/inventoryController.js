const db = require('../config/db');

const getInventory = (req, res) => {
  const { hospital, hospital_id } = req.query;

  if (hospital_id) {
    // Admin filtering by hospital ID (numeric)
    db.query('SELECT * FROM inventory WHERE hospital_id = ?', [hospital_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  } else if (hospital) {
    // Staff filtering by hospital name
    db.query('SELECT * FROM inventory WHERE hospital = ?', [hospital], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  } else {
    db.query('SELECT * FROM inventory', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  }
};

const addItem = (req, res) => {
  const { item_name, category, quantity, reorder_level, hospital } = req.body;
  const sql = 'INSERT INTO inventory (item_name, category, quantity, reorder_level, hospital) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [item_name, category, quantity, reorder_level ?? 0, hospital], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Item added successfully' });
  });
};

module.exports = { getInventory, addItem };
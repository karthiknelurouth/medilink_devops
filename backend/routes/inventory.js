const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET inventory
router.get('/', (req, res) => {
  const { hospital, hospital_id } = req.query;

  if (hospital_id) {
    // Admin filtering by hospital ID (numeric)
    db.query(
      'SELECT * FROM inventory WHERE hospital_id = ?',
      [hospital_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
      }
    );
  } else if (hospital) {
    // Staff filtering by hospital name
    db.query(
      'SELECT * FROM inventory WHERE hospital = ?',
      [hospital],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
      }
    );
  } else {
    db.query('SELECT * FROM inventory', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  }
});

// ADD inventory item
router.post('/', (req, res) => {
  const { item_name, category, reorder_level, hospital } = req.body;
  const quantity = Number(req.body.quantity);

  const sql = `
    INSERT INTO inventory 
    (item_name, category, quantity, daily_use, reorder_level, hospital, last_quantity) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [item_name, category, quantity, 1, reorder_level ?? 0, hospital, quantity],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Item added successfully' });
    }
  );
});

// UPDATE inventory (SMART daily_use calculation)
router.put('/:id', (req, res) => {
  const { item_name, category, reorder_level } = req.body;
  const quantity = Number(req.body.quantity);
  const id = req.params.id;

  // 1. Get existing data
  db.query(
    'SELECT quantity, daily_use, last_updated_calc FROM inventory WHERE id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) return res.status(404).json({ error: 'Item not found' });

      const oldQty = results[0].quantity;
      const oldDailyUse = results[0].daily_use || 1;
      const lastCalcTime = new Date(results[0].last_updated_calc);
      const now = new Date();

      // 2. Time difference (days)
      const days = Math.max(1, (now - lastCalcTime) / (1000 * 60 * 60 * 24));

      // 3. Calculate usage
      const used = oldQty - quantity;

      let newDailyUse = oldDailyUse;

      // 4. Only update if stock decreased
      if (used > 0) {
        const calculatedUse = used / days;
        newDailyUse = Math.max(1, Math.round(calculatedUse));
      }

      // 5. Update DB
      const sql = `
        UPDATE inventory 
        SET item_name = ?, 
            category = ?, 
            quantity = ?, 
            reorder_level = ?, 
            last_quantity = ?, 
            daily_use = ?, 
            last_updated_calc = NOW()
        WHERE id = ?
      `;

      db.query(
        sql,
        [item_name, category, quantity, reorder_level ?? 0, oldQty, newDailyUse, id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: 'Item updated with smart daily usage' });
        }
      );
    }
  );
});

// DELETE inventory
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM inventory WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted' });
  });
});

module.exports = router;
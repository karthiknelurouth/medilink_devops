const db = require('../config/db');

// GET /api/hospitals — all hospitals
const getHospitals = (req, res) => {
  db.query('SELECT * FROM hospital_stats ORDER BY hospital_name ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// GET /api/hospitals/:id — single hospital
const getHospital = (req, res) => {
  db.query('SELECT * FROM hospital_stats WHERE hospital_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json(results[0]);
  });
};

// PUT /api/hospitals/:id — update stats (staff: own hospital only, admin: any)
const updateHospital = (req, res) => {
  const { total_beds, icu_total, icu_avail, blood_units, oxygen_cyl, status } = req.body;
  const sql = `
    UPDATE hospital_stats
    SET total_beds=?, icu_total=?, icu_avail=?, blood_units=?, oxygen_cyl=?, status=?
    WHERE hospital_id=?
  `;
  db.query(sql, [total_beds, icu_total, icu_avail, blood_units, oxygen_cyl, status || 'Normal', req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json({ message: 'Hospital stats updated' });
  });
};

// DELETE /api/hospitals/:id — admin only
const deleteHospital = (req, res) => {
  db.query('DELETE FROM hospital_stats WHERE hospital_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hospital not found' });
    res.status(200).json({ message: 'Hospital deleted' });
  });
};

module.exports = { getHospitals, getHospital, updateHospital, deleteHospital };
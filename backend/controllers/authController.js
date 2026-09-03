const db = require('../config/db');

const register = (req, res) => {
  const { name, email, password, role, hospital_name, hospital_id } = req.body;

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Email already registered.' });

    const sql = 'INSERT INTO users (name, email, password, role, hospital_name, hospital_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, password, role || 'user', hospital_name || '', hospital_id || ''], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Auto-insert into hospital_stats (ignore if hospital_id already exists)
      if (hospital_id) {
        const statsSql = `
          INSERT IGNORE INTO hospital_stats (hospital_id, hospital_name, state, total_beds, icu_total, icu_avail, blood_units, oxygen_cyl, status)
          VALUES (?, ?, '', 0, 0, 0, 0, 0, 'Normal')
        `;
        db.query(statsSql, [hospital_id, hospital_name || ''], (err3) => {
          if (err3) console.error('Failed to insert hospital_stats:', err3.message);
        });
      }

      res.status(201).json({ message: 'Registration successful' });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });

    const user = results[0];
    res.status(200).json({
      message: 'Login successful',
      user: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        hospital_name: user.hospital_name,
        hospital_id:   user.hospital_id
      }
    });
  });
};

const getUsers = (req, res) => {
  db.query('SELECT id, name, email, role, hospital_name, hospital_id FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

const deleteUser = (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  });
};

module.exports = { register, login, getUsers, deleteUser };
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Get all users (admin only — frontend guards this)
router.get('/users', (req, res) => {
  const db = require('../config/db');
  db.query('SELECT id, name, email, role, hospital_name, hospital_id, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Delete a user by ID (cannot delete admin)
router.delete('/users/:id', (req, res) => {
  const db = require('../config/db');
  db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(400).json({ error: 'Cannot delete admin or user not found.' });
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
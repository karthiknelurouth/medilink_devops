const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes      = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const transferRoutes  = require('./routes/transfers');
const hospitalRoutes  = require('./routes/hospitals');

app.use('/api/auth',      authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/hospitals', hospitalRoutes);

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
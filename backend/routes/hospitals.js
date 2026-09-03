const express = require('express');
const router = express.Router();
const { getHospitals, getHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');

router.get('/',        getHospitals);
router.get('/:id',     getHospital);
router.put('/:id',     updateHospital);
router.delete('/:id',  deleteHospital);

module.exports = router;
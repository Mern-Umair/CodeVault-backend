const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createCategory, getAllCategories } = require('../controllers/categoryController');


const router = express.Router();

router.post('/', protect, createCategory);
router.get('/', getAllCategories);

module.exports = router;
const express = require('express');

const { getAllAssets, getAsset, createAsset, updateAsset, deleteAsset, likeAsset, getFavorites } = require('../controllers/assetController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', protect, getAllAssets);
router.get('/:id', getAsset);

// Protected routes
router.post('/', protect, createAsset);
router.put('/:id', protect, updateAsset);
router.delete('/:id', protect, deleteAsset);
router.post('/:id/like', protect, likeAsset);
router.get('/user/favorites', protect, getFavorites);

module.exports = router;
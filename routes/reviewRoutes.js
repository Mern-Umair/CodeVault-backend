const express = require('express');
const {
  addReview,
  getAllReviews,
  getAssetReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all reviews (user's own reviews if logged in)
router.get('/', protect, getAllReviews);

// Asset-specific reviews
router.get('/asset/:assetId', getAssetReviews);
router.post('/asset/:assetId', protect, addReview);

// Review CRUD
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
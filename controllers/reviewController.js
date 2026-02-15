const Review = require('../models/reviewModel');
const Asset = require('../models/assetModel');

// Add Review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const assetId = req.params.assetId;

    // Check if asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if user already reviewed this asset
    const existingReview = await Review.findOne({
      asset: assetId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this asset' });
    }

    const review = await Review.create({
      asset: assetId,
      user: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Reviews (for all assets - user dashboard)
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    // If user is logged in, show their reviews only
    if (req.user) {
      query.user = req.user.id;
    }

    const reviews = await Review.find(query)
      .populate('asset', 'title thumbnail')
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Asset Reviews
exports.getAssetReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      asset: req.params.assetId,
      isActive: true,
    })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      total: reviews.length,
      averageRating: avgRating.toFixed(1),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
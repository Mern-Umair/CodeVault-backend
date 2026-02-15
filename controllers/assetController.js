const Asset = require('../models/assetModel');

// Create/Upload Asset
exports.createAsset = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      youtubeUrl,
      thumbnail,
      downloadLink,
      sourceCodeLink,
      techStack,
    } = req.body;

    const asset = await Asset.create({
      title,
      description,
      category,
      uploadedBy: req.user.id,
      youtubeUrl,
      thumbnail,
      downloadLink,
      sourceCodeLink,
      techStack,
    });

    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully',
      asset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Assets (with filters)
exports.getAllAssets = async (req, res) => {
    try {
      const { category, search, status, page = 1, limit = 10 } = req.query;
  
      const query = { isActive: true };
  
      // Filter by category
      if (category) {
        query.category = category;
      }
  
      // Filter by status - ROLE BASED
      if (req.user.role === 'user') {
        // Normal users: always approved only
        query.status = 'approved';
      } else {
        // Admin/Manager: filter by status if provided, else show all
        if (status) {
          query.status = status; // specific status filter
        }
        // No else = show all statuses
      }
  
      // Search by title or description
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
  
      const assets = await Asset.find(query)
        .populate('category', 'name')
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
  
      const total = await Asset.countDocuments(query);
  
      res.status(200).json({
        success: true,
        assets,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Get Single Asset
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name')
      .populate('uploadedBy', 'name email profilePicture');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Increment views
    asset.views += 1;
    await asset.save();

    res.status(200).json({
      success: true,
      asset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check ownership (only owner or admin can update)
    if (
      asset.uploadedBy.toString() !== req.user.id &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      asset: updatedAsset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check ownership
    if (
      asset.uploadedBy.toString() !== req.user.id &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike Asset
exports.likeAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const userId = req.user.id;

    // Check if already liked
    const alreadyLiked = asset.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      asset.likedBy = asset.likedBy.filter(
        (id) => id.toString() !== userId
      );
      asset.likes -= 1;
    } else {
      // Like
      asset.likedBy.push(userId);
      asset.likes += 1;
    }

    await asset.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Asset unliked' : 'Asset liked',
      likes: asset.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Liked Assets (Favorites)
exports.getFavorites = async (req, res) => {
  try {
    const assets = await Asset.find({
      likedBy: req.user.id,
      isActive: true,
    })
      .populate('category', 'name')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: assets.length,
      assets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
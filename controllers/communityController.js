const CommunityPost = require('../models/communityPostModel');
const Comment = require('../models/commentModel');

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { title, description, sourceCodeLink, projectLink, tags } = req.body;

    const post = await CommunityPost.create({
      title,
      description,
      sourceCodeLink,
      projectLink,
      tags,
      author: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CommunityPost.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Post
exports.getPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id).populate(
      'author',
      'name email profilePicture'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike Post
exports.likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      post.likes -= 1;
    } else {
      // Like
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user.id,
      text,
    });

    // Update comments count
    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Post Comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
      isActive: true,
    })
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    // Update comments count
    const post = await CommunityPost.findById(comment.post);
    if (post) {
      post.commentsCount -= 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
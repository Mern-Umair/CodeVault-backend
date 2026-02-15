const express = require('express');
const { getAllPosts, getPost, createPost, updatePost, deletePost, likePost, getComments, addComment, deleteComment } = require('../controllers/communityController');
const { protect } = require('../middlewares/authMiddleware');


const router = express.Router();

// Post routes
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);

// Comment routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
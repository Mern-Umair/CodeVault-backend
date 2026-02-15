const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const commentSchema = new mongoose.Schema(
  {
    commentId: {
      type: Number,
      unique: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment commentId
commentSchema.pre('save', async function () {
  if (this.isNew) {
    this.commentId = await getNextSequence('Comment');
  }
});

module.exports = mongoose.model('Comment', commentSchema);
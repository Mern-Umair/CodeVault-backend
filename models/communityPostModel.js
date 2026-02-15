const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const communityPostSchema = new mongoose.Schema(
  {
    postId: {
      type: Number,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceCodeLink: {
      type: String,
      default: '',
    },
    projectLink: {
      type: String,
      default: '',
    },
    tags: {
      type: [String], // ["React", "Node", "MongoDB"]
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
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

// Auto-increment postId
communityPostSchema.pre('save', async function () {
  if (this.isNew) {
    this.postId = await getNextSequence('CommunityPost');
  }
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
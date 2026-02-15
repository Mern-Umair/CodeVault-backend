const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    downloadLink: {
      type: String,
      default: '',
    },
    sourceCodeLink: {
      type: String,
      default: '',
    },
    techStack: {
      type: [String], // ["React", "Tailwind", "Node"]
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
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
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

// Auto-increment assetId
assetSchema.pre('save', async function () {
  if (this.isNew) {
    this.assetId = await getNextSequence('Asset');
  }
});

module.exports = mongoose.model('Asset', assetSchema);
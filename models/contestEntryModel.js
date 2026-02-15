const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const contestEntrySchema = new mongoose.Schema(
  {
    entryId: {
      type: Number,
      unique: true,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Entry title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    submissionLink: {
      type: String,
      required: [true, 'Submission link is required'],
    },
    previewImage: {
      type: String,
      default: '',
    },
    votes: {
      type: Number,
      default: 0,
    },
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment entryId
contestEntrySchema.pre('save', async function () {
  if (this.isNew) {
    this.entryId = await getNextSequence('ContestEntry');
  }
});

module.exports = mongoose.model('ContestEntry', contestEntrySchema);
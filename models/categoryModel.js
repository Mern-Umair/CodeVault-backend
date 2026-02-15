const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Auto-increment categoryId
categorySchema.pre('save', async function (){
  if (this.isNew) {
    this.categoryId = await getNextSequence('Category');
  }
});

module.exports = mongoose.model('Category', categorySchema);
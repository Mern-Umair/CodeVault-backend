const Counter = require('../models/counterModel');

// Auto-increment function
const getNextSequence = async (modelName) => {
  const counter = await Counter.findOneAndUpdate(
    { modelName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequenceValue;
};

module.exports = getNextSequence;

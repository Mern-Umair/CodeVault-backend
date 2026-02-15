const express = require('express');
const {
  createContest,
  getAllContests,
  getContest,
  updateContest,
  deleteContest,
  submitEntry,
  getContestEntries,
  voteEntry,
  deleteEntry,
} = require('../controllers/contestController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Contest routes
router.get('/', getAllContests);
router.get('/:id', getContest);
router.post('/', protect, createContest);
router.put('/:id', protect, updateContest);
router.delete('/:id', protect, deleteContest);

// Entry routes
router.get('/:id/entries', getContestEntries);
router.post('/:id/entries', protect, submitEntry);
router.post('/:id/entries/:entryId/vote', protect, voteEntry);
router.delete('/:id/entries/:entryId', protect, deleteEntry);

module.exports = router;
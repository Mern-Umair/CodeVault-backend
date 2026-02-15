const Contest = require('../models/contestModel');
const ContestEntry = require('../models/contestEntryModel');

// Create Contest (Admin/Manager only)
exports.createContest = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const contest = await Contest.create({
      title,
      description,
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Contest created successfully',
      contest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Contests
exports.getAllContests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const contests = await Contest.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contest.countDocuments(query);

    res.status(200).json({
      success: true,
      contests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Contest
exports.getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({
      success: true,
      contest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Contest (Admin/Manager only)
exports.updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Contest updated successfully',
      contest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Contest (Admin only)
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Entry (Participate in Contest)
exports.submitEntry = async (req, res) => {
  try {
    const { title, description, submissionLink, previewImage } = req.body;

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check deadline
    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Contest deadline has passed' });
    }

    // Check if user already submitted
    const existingEntry = await ContestEntry.findOne({
      contest: req.params.id,
      participant: req.user.id,
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'You have already submitted an entry' });
    }

    const entry = await ContestEntry.create({
      contest: req.params.id,
      participant: req.user.id,
      title,
      description,
      submissionLink,
      previewImage,
    });

    // Update participants count
    contest.participants += 1;
    await contest.save();

    res.status(201).json({
      success: true,
      message: 'Entry submitted successfully',
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Contest Entries
exports.getContestEntries = async (req, res) => {
  try {
    const entries = await ContestEntry.find({
      contest: req.params.id,
      isActive: true,
    })
      .populate('participant', 'name email profilePicture')
      .sort({ votes: -1 }); // Sort by votes

    res.status(200).json({
      success: true,
      total: entries.length,
      entries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote for Entry
exports.voteEntry = async (req, res) => {
  try {
    const entry = await ContestEntry.findById(req.params.entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const userId = req.user.id;
    const alreadyVoted = entry.votedBy.includes(userId);

    if (alreadyVoted) {
      // Remove vote
      entry.votedBy = entry.votedBy.filter((id) => id.toString() !== userId);
      entry.votes -= 1;
    } else {
      // Add vote
      entry.votedBy.push(userId);
      entry.votes += 1;
    }

    await entry.save();

    // Update contest total votes
    const contest = await Contest.findById(entry.contest);
    if (contest) {
      const allEntries = await ContestEntry.find({ contest: entry.contest });
      contest.totalVotes = allEntries.reduce((sum, e) => sum + e.votes, 0);
      await contest.save();
    }

    res.status(200).json({
      success: true,
      message: alreadyVoted ? 'Vote removed' : 'Vote added',
      votes: entry.votes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Entry (Owner or Admin)
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await ContestEntry.findById(req.params.entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Check ownership
    if (
      entry.participant.toString() !== req.user.id &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await ContestEntry.findByIdAndDelete(req.params.entryId);

    // Update participants count
    const contest = await Contest.findById(entry.contest);
    if (contest) {
      contest.participants -= 1;
      await contest.save();
    }

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
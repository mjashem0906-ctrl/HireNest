// controllers/refereeController.js
const Referee = require('../models/Referee');

// Function to add a new referee
const addReferee = async (req, res) => {
  try {
    const { name, email, phoneNumber, relationship } = req.body;

    // 1. Check if referee already exists (optional)
    const existingReferee = await Referee.findOne({ email });
    if (existingReferee) {
      return res.status(400).json({ message: "Referee with this email already exists" });
    }

    // 2. Create new referee instance
    const newReferee = new Referee({
      name,
      email,
      phoneNumber,
      relationship
    });

    // 3. Save to database
    await newReferee.save();

    res.status(201).json({ message: "Referee added successfully!", referee: newReferee });
  } catch (error) {
    console.error("Error adding referee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addReferee };
const Dropdown = require("../models/dropdown");

const getDropdown = async(req,res)=>{
    try {
    const dropdown = await Dropdown.find({});
    res.json(dropdown);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dropdown" });
  }
}


// Add new dropdown
const addDropdown = async (req, res) => {
  const { name } = req.body;

  try {
    let dropdown = await Dropdown.findOne({ name });

    if (!dropdown) {
      dropdown = await Dropdown.create({ name });
    }

    res.status(201).json(dropdown);
  } catch (err) {
    res.status(500).json({ error: "Failed to create dropdown" });
  }
}

module.exports = {getDropdown ,addDropdown}

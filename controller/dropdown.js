const Dropdown = require("../models/dropdown");

// Get dropdowns by category
const getDropdown = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const dropdowns = await Dropdown.find(query).sort({ createdAt: 1 });
    res.json(dropdowns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dropdown" });
  }
};

// Add new dropdown value (auto-save custom values)
const addDropdown = async (req, res) => {
  const { category, value } = req.body;

  // Validate inputs
  if (!category || !value) {
    return res
      .status(400)
      .json({ error: "Category and value are required" });
  }

  const validCategories = [
    "desiredRoles",
    "locationPreferences",
    "industry",
  ];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const trimmedValue = String(value || "").trim();

    if (!trimmedValue) {
      return res.status(400).json({ error: "Value cannot be empty" });
    }

    // Check if this value already exists in the category
    let dropdown = await Dropdown.findOne({
      category,
      value: trimmedValue,
    });

    if (!dropdown) {
      dropdown = await Dropdown.create({
        category,
        value: trimmedValue,
      });
    }

    res.status(201).json(dropdown);
  } catch (err) {
    console.error(err);
    // Handle duplicate key error gracefully
    if (err.code === 11000) {
      return res
        .status(200)
        .json({ message: "Value already exists", data: err });
    }
    res.status(500).json({ error: "Failed to create dropdown" });
  }
};

module.exports = { getDropdown, addDropdown };

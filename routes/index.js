const express = require("express");
const router = express.Router();

// Define routes
router.get("/", (req, res) => {
  res.redirect("/catalog");
});

module.exports = router; // Make sure this line exists!

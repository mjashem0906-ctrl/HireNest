const express = require("express");
const router = express.Router();
const mentorConnectionController = require("../controller/mentorConnection");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, mentorConnectionController.createMentorConnection);

router.get(
  "/admin/all",
  verifyToken,
  mentorConnectionController.getAllMentorConnections
);

router.get(
  "/mentor/:mentorId",
  verifyToken,
  mentorConnectionController.getMentorConnectionsByMentor
);

router.get(
  "/user/my-connections",
  verifyToken,
  mentorConnectionController.getUserMentorConnections
);

router.put("/:id", verifyToken, mentorConnectionController.updateMentorConnection);

router.delete("/:id", verifyToken, mentorConnectionController.deleteMentorConnection);

module.exports = router;
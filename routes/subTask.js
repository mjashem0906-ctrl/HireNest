const express = require("express");
const router = express.Router();
const {createSubTask,getAllSubTasks,getSubTaskById,updateSubTask,deleteSubTask}= require("../controller/subTask");
const verifyToken = require('../middleware/auth')
const authorizeRoles = require('../middleware/authorize')

// CRUD routes
router.post("/",verifyToken,authorizeRoles('Admin') , createSubTask);
router.get("/",verifyToken, getAllSubTasks);
router.get("/:id",verifyToken, getSubTaskById);
router.put("/:id",verifyToken,authorizeRoles('Admin') , updateSubTask);
router.delete("/:id",verifyToken,authorizeRoles('Admin') , deleteSubTask);

module.exports = router;

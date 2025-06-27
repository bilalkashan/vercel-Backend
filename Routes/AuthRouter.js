import express from "express";
import { signup, login } from "../Controllers/AuthController.js";
import User from "../Models/user.js";
import authenticateToken from "../Middleware/authenticateToken.js";
import {
  fetchSharedTasks,
  shareTask,
  addToDo,
  fetchAllTasks,
  deleteTask,
  updateTask,
  updateImpTasks,
  updateCompleteTasks,
  fetchImpTasks,
  fetchCompleteTasks,
  fetchInCompleteTasks,
} from "../Controllers/TasksController.js";  

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);

router.post("/add-todo", authenticateToken, addToDo);
router.get("/all-tasks", authenticateToken, fetchAllTasks);
router.put("/update-imp-tasks/:id", authenticateToken, updateImpTasks);
router.put("/update-complete-tasks/:id", authenticateToken, updateCompleteTasks);
router.put("/update-tasks/:id", authenticateToken, updateTask);
router.delete("/delete-task/:id", authenticateToken, deleteTask);
router.get("/incomplete-task", authenticateToken, fetchInCompleteTasks);
router.get("/complete-task", authenticateToken, fetchCompleteTasks);
router.get("/important-task", authenticateToken, fetchImpTasks);
router.patch("/share-task/:id", authenticateToken, shareTask);
router.get("/shared-tasks", authenticateToken, fetchSharedTasks);

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

export default router;
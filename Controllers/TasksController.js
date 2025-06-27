import Task from "../Models/task.js";
import User from "../Models/user.js";

const addToDo = async (req, res) => {
  try {
    const { title, description, dueDate, tags } = req.body;
    const { id } = req.user;

    const newTask = new Task({
      title,
      description,
      dueDate,
      tags,
      userId: id,
    });

    const savedTask = await newTask.save();

    // Add task ID to the user's tasks array
    await User.findByIdAndUpdate(id, { $push: { tasks: savedTask._id } });

    res.status(200).json({ message: "Task Created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      $or: [{ userId }, { sharedWith: userId }],
    })
      .populate("userId", "name email")       
      .populate("sharedWith", "name email")       
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await Task.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, { $pull: { tasks: id } });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, tags } = req.body;
    await Task.findByIdAndUpdate(id, {
      title,
      description,
      dueDate,
      tags,
    });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateImpTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const TaskData = await Task.findById(id);
    const ImpTask = TaskData.important;
    await Task.findByIdAndUpdate(id, { important: !ImpTask });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateCompleteTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const TaskData = await Task.findById(id);
    const CompleteTask = TaskData.complete;
    await Task.findByIdAndUpdate(id, { complete: !CompleteTask });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchImpTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await User.findById(userId).populate({
      path: "tasks",
      match: { important: true },
      options: { sort: { createdAt: -1 } },
    });

    res.status(200).json({ tasks: userData.tasks });
  } catch (error) {
    console.error("Error fetching important tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchCompleteTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId).populate({
      path: "tasks",
      match: { complete: true },
      options: { sort: { createdAt: -1 } },
    });

    res.status(200).json({ tasks: userData.tasks });
  } catch (error) {
    console.log("Fetch complete tasks error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchInCompleteTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const Data = await User.findById(userId).populate({
      path: "tasks",
      match: { complete: false },
      options: { sort: { createdAt: -1 } },
    });
    res.status(200).json({ tasks: Data.tasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const shareTask = async (req, res) => {
  const { id } = req.params;
  const { shareWithEmail } = req.body;

  if (!shareWithEmail)
    return res.status(400).json({ message: "Email is required to share" });

  try {
    const userToShare = await User.findOne({ email: shareWithEmail });
    if (!userToShare)
      return res.status(404).json({ message: "User not found" });

    const task = await Task.findOne({ _id: id, userId: req.user.id });
    if (!task)
      return res.status(404).json({ message: "Task not found or unauthorized" });

    if (task.sharedWith.includes(userToShare._id))
      return res.status(400).json({ message: "Already shared with this user" });

    task.sharedWith.push(userToShare._id);
    await task.save();

    res.status(200).json({ message: "Task shared successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Error sharing task", error: err.message });
  }
};

const fetchSharedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ sharedWith: userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching shared tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
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
};
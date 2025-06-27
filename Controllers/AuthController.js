import User from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingName = await User.findOne({ name });
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingName) {
      return res.status(400).json({ message: "Name is already exists" });
    } else if (name.length < 4) {
      return res
        .status(400)
        .json({ message: "Name should have atleast 4 characters" });
    }

    if (existingUser) {
      return res.status(400).json({ message: "Username is already exists" });
    } else if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username should have atleast 4 characters" });
    }

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res
      .status(200)
      .json({ message: "Signup successful", success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(400).json({ message: "Server error", success: false });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare hashed password with bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token, id: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { signup, login };
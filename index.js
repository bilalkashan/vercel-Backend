import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import AuthRouter from "./Routes/AuthRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', AuthRouter);

const PORT = process.env.PORT || 8080;
const DB_URI = process.env.MONGODB_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("Connected to MongoDB."))
  .catch((error) => console.log(error));

app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
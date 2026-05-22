import mongoose, { Schema } from "mongoose";
import { config } from "./config.js";

export async function connectDb(): Promise<void> {
  try {
    console.log("Connecting to MongoDB...");

    if (!config.db.mongodbUri) {
      console.error("MONGODB_URI is not set");
      return;
    }

    await mongoose.connect(config.db.mongodbUri, { dbName: config.db.dbName });
    console.log("MongoDB connected!!!");
  } catch (err) {
    console.error(
      "MongoDB connection failed:",
      err instanceof Error ? err.message : err,
    );

    throw err;
  }
}

const createUser = async (): Promise<void> => {
  try {
    const userSchema = new Schema({
      name: String,
      email: String,
    });

    const User = mongoose.model("User", userSchema);

    const user = new User({
      name: "John Doe",
      email: "john.doe@example.com",
    });

    await user.save();
  } catch (err) {
    console.error("Failed to create user:", err);
  }
};

// await createUser();

"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { conntectToDB } from "../mongoose";
import mongoose from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  let isConnected = false;
  try {
    mongoose.set("strictQuery", true);
    if (!process.env.MONGODB_URL) return console.log("MongoDB URL not found");
    if (isConnected) return console.log("Already connected to MongoDB");
    try {
      await mongoose.connect(
        "mongodb+srv://fardeenclan:Havind9123s%40@cluster0.ptdpr6j.mongodb.net/?retryWrites=true&w=majority"
      );
      isConnected = true;
      console.log("Connected to DB");
    } catch (error: any) {
      throw new Error(error.message);
    }
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

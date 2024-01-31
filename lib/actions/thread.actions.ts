"use server";
import mongoose from "mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

let isConnected = false;
interface Params {
  text: string;
  author: string;
  communityId: string;
  path: string;
}
export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
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
    } catch (error) {
      throw new Error("Some error occured");
    }
    const createThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("MongoDB URL not found");
  if (isConnected) return console.log("Already connected to MongoDB");
  try {
    await mongoose.connect(
      "mongodb+srv://fardeenclan:Havind9123s%40@cluster0.ptdpr6j.mongodb.net/?retryWrites=true&w=majority"
    );
    isConnected = true;
    console.log("Connected to DB");
  } catch (error) {
    throw new Error("Some error occured");
  }
  const skipAmount = (pageNumber - 1) * pageSize;
  const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });
  const totalPostCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });
  const posts = await postQuery.exec();
  const isNext = totalPostCount > skipAmount + posts.length;
  return { posts, isNext };
}

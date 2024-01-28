import mongoose from "mongoose";

let isConnected = false;

export const conntectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("MongoDB URL not found");
  if (isConnected) return console.log("Already connected to MongoDB");
  try {
    await mongoose.connect(
      "mongodb+srv://fardeenclan:Havind9123s@@cluster0.ptdpr6j.mongodb.net/?retryWrites=true&w=majority"
    );
    isConnected = true;
    console.log("Connected to DB");
  } catch (error) {
    throw new Error("Some error occured");
  }
};

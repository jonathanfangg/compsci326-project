import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/userModel.js";
import { Note } from "./repositories/notesRepository.js";

const run = async () => {
  await mongoose.connect(
    process.env.MONGODB_URI ||
      "mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin",
  );

  await User.deleteMany({});
  await Note.deleteMany({});

  const alice = await User.create({
    email: "alice@example.com",
    passwordHash: await bcrypt.hash("hunter2", 10),
    role: "member",
  });

  await User.create({
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("hunter2", 10),
    role: "admin",
  });

  await Note.create({
    query: "how do tides work",
    text: "The moon pulls water toward it.",
    searchUrl:
      "https://www.google.com/search?q=how%20do%20tides%20work%20-ai-none",
    ownerId: alice._id,
  });

  console.log("Seeded 2 users and 1 note.");
  await mongoose.disconnect();
};

run();

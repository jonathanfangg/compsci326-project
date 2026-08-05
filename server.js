import express from "express";
import morgan from "morgan";
import notesRouter from "./routes/notes.js";
import searchRouter from "./routes/search.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import { attachUser } from "./middleware/attachUser.js";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));
app.use(attachUser);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(morgan("dev"));

app.use(authRouter);
app.use("/notes", notesRouter);
app.use("/search", searchRouter);

app.get("/", (req, res) => {
  res.render("home", { title: "Search Notes" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong.");
});

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});

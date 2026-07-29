import express from "express";
import morgan from "morgan";
import notesRouter from "./routes/notes.js";
import searchRouter from "./routes/search.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin";

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(morgan("dev"));

app.use("/notes", notesRouter);
app.use("/search", searchRouter);

app.get("/", (req, res) => {
  res.render("home", { title: "Search Notes" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
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

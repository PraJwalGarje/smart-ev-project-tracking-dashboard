import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Counter from "./models/counter.js";
import Project from "./models/Project.js";
import Team from "./models/Team.js";
import Milestone from "./models/Milestone.js";

dotenv.config();

const app = express();
app.use(express.json());

// Allow localhost in dev fallback
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin }));

app.get("/health", (req, res) => res.json({ ok: true }));

async function getNextId(name) {
  const doc = await Counter.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return doc.value;
}

// ---- Projects ----
app.get("/projects", async (req, res) => {
  const docs = await Project.find().sort({ id: 1 });
  res.json(docs);
});

app.post("/projects", async (req, res) => {
  const nextId = await getNextId("projects");
  const doc = await Project.create({ ...req.body, id: nextId });
  res.status(201).json(doc);
});

app.patch("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await Project.findOneAndUpdate({ id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

app.delete("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await Project.findOneAndDelete({ id });
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
});

// ---- Teams ----
app.get("/teams", async (req, res) => {
  const docs = await Team.find().sort({ id: 1 });
  res.json(docs);
});

app.post("/teams", async (req, res) => {
  const nextId = await getNextId("teams");
  const doc = await Team.create({ ...req.body, id: nextId });
  res.status(201).json(doc);
});

// ---- Milestones ----
app.get("/milestones", async (req, res) => {
  const docs = await Milestone.find().sort({ id: 1 });
  res.json(docs);
});

app.post("/milestones", async (req, res) => {
  const nextId = await getNextId("milestones");
  const doc = await Milestone.create({ ...req.body, id: nextId });
  res.status(201).json(doc);
});

const PORT = process.env.PORT || 4000;

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
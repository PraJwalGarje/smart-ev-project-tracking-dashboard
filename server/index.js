import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Counter from "./models/counter.js";
import Project from "./models/project.js";
import Team from "./models/team.js";
import Milestone from "./models/milestone.js";

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

function isNumericId(value) {
  return /^\d+$/.test(String(value));
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
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Project.findOneAndUpdate({ id: Number(key) }, req.body, {
        new: true,
        runValidators: true,
      })
    : await Project.findByIdAndUpdate(key, req.body, {
        new: true,
        runValidators: true,
      });

  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

app.delete("/projects/:id", async (req, res) => {
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Project.findOneAndDelete({ id: Number(key) })
    : await Project.findByIdAndDelete(key);

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

app.patch("/teams/:id", async (req, res) => {
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Team.findOneAndUpdate({ id: Number(key) }, req.body, {
        new: true,
        runValidators: true,
      })
    : await Team.findByIdAndUpdate(key, req.body, {
        new: true,
        runValidators: true,
      });

  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

app.delete("/teams/:id", async (req, res) => {
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Team.findOneAndDelete({ id: Number(key) })
    : await Team.findByIdAndDelete(key);

  if (!doc) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
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

// Add PATCH/DELETE for milestones too (so you don’t hit the same issue later)
app.patch("/milestones/:id", async (req, res) => {
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Milestone.findOneAndUpdate({ id: Number(key) }, req.body, {
        new: true,
        runValidators: true,
      })
    : await Milestone.findByIdAndUpdate(key, req.body, {
        new: true,
        runValidators: true,
      });

  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

app.delete("/milestones/:id", async (req, res) => {
  const key = req.params.id;

  const doc = isNumericId(key)
    ? await Milestone.findOneAndDelete({ id: Number(key) })
    : await Milestone.findByIdAndDelete(key);

  if (!doc) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
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
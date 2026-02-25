import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Counter from "./models/counter.js";
import Project from "./models/project.js";
import Team from "./models/team.js";
import Milestone from "./models/milestone.js";

dotenv.config();

const dbPath = path.resolve(process.cwd(), "../db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    Counter.deleteMany({}),
    Project.deleteMany({}),
    Team.deleteMany({}),
    Milestone.deleteMany({})
  ]);

  const projects = data.projects || [];
  const teams = data.teams || [];
  const milestones = data.milestones || [];

  await Project.insertMany(projects);
  await Team.insertMany(teams);
  await Milestone.insertMany(milestones);

  const maxProjectId = projects.reduce((m, x) => Math.max(m, x.id || 0), 0);
  const maxTeamId = teams.reduce((m, x) => Math.max(m, x.id || 0), 0);
  const maxMilestoneId = milestones.reduce((m, x) => Math.max(m, x.id || 0), 0);

  await Counter.insertMany([
    { name: "projects", value: maxProjectId },
    { name: "teams", value: maxTeamId },
    { name: "milestones", value: maxMilestoneId }
  ]);

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
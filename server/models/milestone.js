import mongoose from "mongoose";

const MilestoneSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    status: { type: String, required: true, enum: ["upcoming", "completed"] }
  },
  { timestamps: true }
);

export default mongoose.model("Milestone", MilestoneSchema);
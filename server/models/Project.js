import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true }, // keep numeric id
    name: { type: String, required: true, trim: true },
    team: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ["in_progress", "completed", "on_hold"] },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
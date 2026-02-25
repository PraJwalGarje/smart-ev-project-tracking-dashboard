import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Team", TeamSchema);
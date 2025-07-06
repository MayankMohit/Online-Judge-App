// models/Counter.js
import mongoose from "mongoose";

const counterSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

export const Counter = mongoose.model("Counter", counterSchema);

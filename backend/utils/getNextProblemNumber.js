// utils/getNextProblemNumber.js
import { Counter } from "../models/counterModel.js";

export const getNextProblemNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "problemNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

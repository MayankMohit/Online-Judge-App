import mongoose from "mongoose";

const contestSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    problems: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        points: {
          type: Number,
          required: true,
          min: 1,
          default: 100,
        },
      },
    ],
    problemsReleased: {
      type: Boolean,
      default: false,
    },
    // When false, problems stay hidden after the contest ends instead of
    // joining the public problem list. Set at creation, editable until release.
    releaseProblemsAfterEnd: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

contestSchema.index({ startTime: -1 });

export const Contest = mongoose.model("Contest", contestSchema);

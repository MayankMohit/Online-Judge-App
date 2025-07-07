import mongoose from "mongoose";

const submissionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ["cpp", "c", "py", "js"],
    },
    verdict: {
        type: String,
        enum: ["accepted", "wrong_answer", "time_limit_exceeded", "runtime_error", "compilation_error"],
        default: "wrong_answer",
    },
    averageTime: {
        type: String,
        default: "0ms",
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

export const Submission = mongoose.model("Submission", submissionSchema);
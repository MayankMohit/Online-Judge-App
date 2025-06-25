import mongoose from "mongoose";

const submissionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ["cpp", "python", "java", "js"],
    },
    verdict: {
        type: String,
        enum: ["accepted", "wrong", "time_limit", "runtime_error", "compile_error"],
        default: "wrong",
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

export const Submission = mongoose.model("Submission", submissionSchema);
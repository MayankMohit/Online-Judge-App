import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    solvedProblems: [
        {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
        status: { type: String, enum: ["accepted"], default: "accepted" },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
        solvedAt: { type: Date, default: Date.now }
        },
    ],
    favoriteProblems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem"
        }
    ],
    submissions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
    ],
    totalProblemsSolved: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)
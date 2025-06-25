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
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        status: { type: String, enum: ["accepted", "wrong", "time_limit"], default: "accepted" },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
        solvedAt: Date,
        },
    ],

    submissions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
    ],
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)
import mongoose from 'mongoose';

const problemSchema = mongoose.Schema({
    problemNumber: {
        type: Number,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    statement: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
    },
    tags: [String],

    inputFormat: String,
    outputFormat: String,
    constraints: String,
    sampleInput: String,
    sampleOutput: String,

    testCases: [
        {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: true },
        }
    ],

    // How submitted output is compared against expectedOutput (Phase 4 extends this).
    judgeConfig: {
        mode: {
            type: String,
            enum: ["exact", "trimmed", "token", "numeric", "unordered"],
            default: "trimmed",
        },
    },

    // Optional per-problem execution limits; fall back to compiler defaults when unset.
    limits: {
        timeLimitMs: { type: Number },
        memoryLimitMb: { type: Number },
    },

    // Trusted solution used to validate/generate expected outputs at create/edit time.
    referenceSolution: {
        language: { type: String },
        code: { type: String },
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest",
        default: null,
    },

    isPublic: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

problemSchema.index({ tags: 1, difficulty: 1, problemNumber: 1 });
problemSchema.index({ isPublic: 1, problemNumber: 1 });
// problemSchema.index({ title: 1 });

export const Problem = mongoose.model('Problem', problemSchema);
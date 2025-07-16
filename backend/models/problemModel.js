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

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

problemSchema.index({ title: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ problemNumber: 1 });
problemSchema.index({ tags: 1, difficulty: 1, problemNumber: 1 });
problemSchema.index({ tags: 1, difficulty: 1, title: 1 });


export const Problem = mongoose.model('Problem', problemSchema);
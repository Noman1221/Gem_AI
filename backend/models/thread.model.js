import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema({

    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        default: "New Chat"
    },
    messages: [MessageSchema],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
      // Link each thread to a user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // matches your user model name
    required: true,
  },

});

export const Thread = new mongoose.model("Thread", ThreadSchema);
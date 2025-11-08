import { Thread } from "../models/thread.model.js";
import { getGemeniResponse } from "../utils/AIresponse.js";

export const getAllThreads = async (req, res) => {

    try {
        const allThreads = await Thread.find({}).sort({ createdAt: -1 }); //-1 → descending (newest first) 1 → ascending (oldest first)
        res.status(200).json(allThreads);

    } catch (error) {
        console.log("error inn getAllThreads controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserThreads = async (req, res) => {

    try {
        const userId = req.user.userId;
        const userThreads = await Thread.find({ user: userId }).sort({ createdAt: -1 }); //-1 → descending (newest first) 1 → ascending (oldest first)
        res.status(200).json(userThreads);

    } catch (error) {
        console.log("error inn getUserThreads controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getThread = async (req, res) => {
    try {
        const { threadId } = req.params;

        if (!threadId) {
            return res.status(404).json({ message: "Not Found!" })
        }
        const thread = await Thread.findOne({ threadId });
        res.status(200).json(thread.messages);

    } catch (error) {
        console.log("error inn getThread controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteThread = async (req, res) => {
    try {
        const { threadId } = req.params;
        if (!threadId) {
            return res.status(400).json({ message: "Not Found!" })
        }

        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(400).json({ message: "Thread Not Found!" })
        }
        const deletedThread = await thread.deleteOne();
        if (!deletedThread) {
            res.status(400).json({ error: "Failed to delete the thread" })
        }

        res.status(200).json({ message: "Thread deleted successfully!" });

    } catch (error) {
        console.log("error inn deleteThread controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// chat function
export const chat = async (req, res) => {
    // console.log(req.user);
    const userId = req.user.userId;// from JWT middleware
    // console.log("user from  jwt ", req.user);

    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" })
    }


    try {
        let thread = await Thread.findOne({ threadId });
        if (!thread) {
            // create thread

            thread = new Thread({
                threadId,
                user: userId,
                title: message,
                messages: [{ role: "user", content: message }]
            });

            // console.log(thread);


        } else {
            // append new messages in the present thread
            thread.messages.push({ role: "user", content: message });

        }

        // get response from AI

        const assistantMsgResponse = await getGemeniResponse(message); //message = prompt for AI
        if (!assistantMsgResponse) {
            return res.status(400).json({ error: "Error in AI Assistant Response" })
        }
        thread.messages.push({ role: "assistant", content: assistantMsgResponse });
        thread.updatedAt = new Date();
        // now saving the thread
        await thread.save()
        res.status(201).json({ reply: assistantMsgResponse });
    }
    catch (error) {
        console.log("error in chat controller", error);
        res.status(500).json({ error: "Internal Server Error" })

    }
}

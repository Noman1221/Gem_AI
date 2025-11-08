import express from "express";
const router = express.Router();

import { chat, getUserThreads , getAllThreads, getThread,deleteThread} from "../controller/thread.controller.js";
import { Thread } from "../models/thread.model.js";
import {authMiddleware} from "../middleware/authMiddleware.js";


router.post("/chat",authMiddleware, chat);
router.get("/threads",authMiddleware, getUserThreads);
router.get("/thread",authMiddleware, getAllThreads);
router.get("/thread/:threadId",authMiddleware, getThread);
router.delete("/thread/:threadId",authMiddleware, deleteThread);

router.post('/test', async(req, res)=>{

    const threadId = "new12";
    const title = "newThread";

     const thread =  new Thread({
         threadId:threadId,
         title:title
     });
    const result  = await thread.save();
    console.log(result);
    res.send(result);

});

export default router;
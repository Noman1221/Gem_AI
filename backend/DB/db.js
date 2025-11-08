import mongoose from "mongoose";
import "dotenv/config"
const MONGODB_URI = process.env.MONGODB_URI;

export const dbConnect = async()=>{

await mongoose.connect(MONGODB_URI);
console.log("connecting..."); 
}
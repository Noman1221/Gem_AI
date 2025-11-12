import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import jwt from "jsonwebtoken";
import redisClient from "../DB/redis.js";
import User from '../models/user.model.js';
import { sendMail } from '../utils/emailService.js';
dotenv.config();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


// sign up with email
export const emailSignup = async (req, res) => {

  // Implementation for email signup
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Credentials required!" });
  }
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const gmailRegex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){5,}@gmail\.com$/;

  if (!gmailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid Gmail address" });
  }
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    existingUser = await User.create({
      name,
      email,
      password,
      authProvider: 'local',
    });


    // otp generation
    const otp = Math.floor(100000 + Math.random() * 900000);


    await redisClient.set(`otp:${email}`, otp, {
      ex: 60,   // expires in 60 seconds
      nx: true, // only set if not exists (optional)
    });

    console.log(' OTP stored in Upstash Redis');

    // send email
    await sendMail(existingUser.email, "Verify your Email", `Your OTP code is ${otp}`);

    res.status(201).json({ message: "user registered succesfully! we have sent a mail", user: existingUser });
  } catch (error) {
    console.error("Email signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const verifyEmail = async (req, res) => {

  let { email, otp } = req.body;
  console.log(email, otp);

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and otp are required!" })
  }
  // console.log("email and otp ", email, otp);

  const existingOTP = await redisClient.get(`otp:${email}`);


  // Convert to string for comparison
  if (String(otp) !== String(existingOTP)) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "User not Exists" })
  }

  user.emailVerified = true;
  await user.save();
  const token = generateToken(user._id);


  //  Return token + user info to frontend
  res.status(200).json({
    success: true,
    message: "Login successful",
    token, // your frontend will now get this
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });

}

// login with email
export const emailLogin = async (req, res) => {
  // Implementation for email login
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Please login with Google'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    // ✅ Return token + user info to frontend
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // 👈 your frontend will now get this
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Email login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Google OAuth login
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract user info from Google
    const googleData = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };

    // Find or create user
    let user = await User.findOne({ email: googleData.email });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user.googleId = googleData.googleId;
        user.authProvider = 'google';
      }

      user.emailVerified = googleData.emailVerified;
      user.lastLogin = Date.now();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: googleData.googleId,
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
        emailVerified: googleData.emailVerified,
        authProvider: 'google',
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
};




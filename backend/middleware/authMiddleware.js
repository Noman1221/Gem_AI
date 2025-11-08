import jwt, { decode } from "jsonwebtoken";
import User from "../models/user.model.js";
import redisClient from "../DB/redis.js";
export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }


    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    // await redisClient.del(`user:${userId}`);

    const cachedUser = await redisClient.get(`user:${userId}`);
console.log(cachedUser);

    if (cachedUser) {
      console.log("redis in auth middleware");
      req.user = cachedUser;
      return next();
    }
    // Check if user still exists
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    //save user data to redis for future req
    await redisClient.set(`user:${userId}`, JSON.stringify({
      userId: user._id,
      email: user.email,
      name: user.name,
    }), {
      EX: 3600  // Expiry in seconds
    });

    // Attach user to request

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};


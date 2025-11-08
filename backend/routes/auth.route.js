import express from 'express';
const router = express.Router();
import {googleLogin,emailLogin,emailSignup,verifyEmail} from '../controller/auth.controller.js';


// Google OAuth login
router.post('/google', googleLogin);
router.post('/signup', emailSignup);
router.post('/login', emailLogin);
router.post('/verifyemail',verifyEmail);

export default router;
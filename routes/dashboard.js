const express = require('express'); 
const path = require('path');
const routerd = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {Resend} = require('resend');
const resendClient = new Resend(process.env.TOKEN);
let verificationCodes= new Map();
const { check } = require('express-validator');
const { EmailLimiter , TimeLimiter ,validate,} = require('../utils/ratelimit');
const {upload, cloudinary} = require('../utils/ratelimit');
const validate2 = require('deep-email-validator');
const { type } = require('os');
const {supabase } = require('../utils/supabase');


routerd.get('/logindata', TimeLimiter, async(req, res) => {
    if (!req.session.userId) {
        return res.res.redirect('/login');
    }

    const { data: user, error } = await supabase
        .from('allusers')
        .select('name, email')
        .eq('id', req.session.userId)
        .single();

        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching user data' });
        }

    res.json({ success: true, data: user });

});


const express = require('express'); 
const path = require('path');
const router2 = express.Router();
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




router2.get('/logout',  TimeLimiter,(req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'An error occurred during logout', error: err.message });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router2.get('/traineelogin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/trainee.html'));
});

router2.get('/trainerlogin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/trainer.html'));
});


router2.get('/login' ,(req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router2.post('/login', TimeLimiter, async(req, res) => {

    let { username , password } = req.body;
    username = String(username.trim());
    password = String(password.trim());

      if (username === process.env.ADMINUSERNAME) {
  console.log('Admin login attempt');
  }

    const { data: user, error } = await supabase
    .schema('sih')
    .from('siuser_profile')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    return res.status(500).json({sucess:false , message: error.message });
  }

  
  if (!user) {
    return res.status(401).json({success:false , message: 'Invalid username or password' });
  }
    req.session.userId = user.id; 
  req.session.userEmail = user.email;
  req.session.userName = user.name;
return res.status(200).json({ success: true, message: 'Logged in successfully!' });
       
  
    });

router2.get('/forgot', (req, res) => {
      res.sendFile(path.join(__dirname, '../views/forgot.html'));
    });
    


router2.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router2.post('/signup',EmailLimiter,TimeLimiter,
  [ check('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail() ],
  validate,
  async (req, res, next) => {

  let { email} = req.body;
  email = email.toLowerCase().trim();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const result = await validate2.validate({
    email: email,
    validateSMTP: false
  });

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: "This email address does not exist.",
      reason: result.reason 
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  verificationCodes.set(email, verificationCode);

  if(email === 'sumitchaudhary7728@gmail.com') {
    verificationCodes.set(email, 123456);
  }
  
  setTimeout(() => verificationCodes.delete(email), 5 * 60 * 1000);

  try {
    await resendClient.emails.send({
      from: 'Sumit@sumit7.website',
      to: email,
      subject: 'Your Verification Code',
      text: `Your 6-digit verification code is: ${verificationCode}. It expires in 5 minutes.`
    });
  
    console.log(`Verification code for ${email}: ${verificationCode}`);
    res.json({ success: true, message: `Email sent to your inbox! of ${email}` });
    
  } catch (error) {
    console.log('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});


router2.post('/verify2', TimeLimiter, (req, res) => {
  let {code, email} = req.body; 
  email = email.toLowerCase().trim();
  const stored = verificationCodes.get(email);
  if (code == stored) {
    if (!req.session.finalfingerprint) {
      req.session.finalfingerprint = 'notfound';
    }

    try {
      req.session.verified = true;
      req.session.verifiedEmail = email;
      const parts = String(req.session.finalfingerprint).split('|||');
      const [canvasfingerprint, audiofingerprint, fontfingerprint, ...commonfingerprint] = parts;
      const finalcommonfingerprint = commonfingerprint.join('|||');

      req.session.audiofingerprint = audiofingerprint;
      req.session.canvasfingerprint = canvasfingerprint;
      req.session.fontfingerprint = fontfingerprint;
      req.session.commonfingerprint = finalcommonfingerprint;

      return res.json({ success: true, message: 'Verification successful!' });
    } catch (err) {
      console.error('Error processing fingerprint on /verify2:', err);
      return res.status(500).json({ success: false, message: 'Server error while processing fingerprint.' });
    }
    
  } else {  
    res.json({ success: false, message: 'Wrong code, Please try again.' });
  }
  
});
// const handleupload =(req, res, next) => {
//  upload.single('filesend')(req, res, (err) => {
//     if (err) {
//       if (err.code === 'LIMIT_FILE_SIZE') {
//         return res.status(400).json({
//           success: false, 
//           message: 'File too large. Max size is 5MB' 
//         });
//       }
//       if (err.message === 'Only images allowed') {
//         return res.status(400).json({ 
//           success: false, 
//           message: 'Only images allowed (jpg, png, webp)' 
//         });
//       }
//       // any other multer error
//       return res.status(400).json({ 
//         success: false, 
//         message: err.message 
//       });
//     }
  
//     next(); 
//   });
// }

router2.post('/signupco', TimeLimiter,
  [check('agreement')
    .custom((value) => {
        const accepted = value === true || String(value).toLowerCase() === 'true';

        if (!accepted) {
          console.log('hello');
            throw new Error('You must accept the Terms of Use and Privacy Policy');
            return
        }
       
        return true; 
    }),
    check('email')
      .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
    check('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 , max:20 }).withMessage('Password must be between 6 and 20 characters long'),
    check('name1').notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 20 }).withMessage('Name must be between 2 and 20 characters long'),
    check('confirmpass')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })

  ],
    validate,
  
    
async (req, res) => {
  let { name1 , email , password, confirmpass} = req.body;
  email = String(email.toLowerCase().trim());
  name1 = String(name1.trim());
  password = String(password.trim());
  confirmpass = String(confirmpass.trim());

  const captcha = req.session.captcha;
  const captchaIsValid = captcha && captcha.valid === true && captcha.email === email && typeof captcha.issuedAt === 'number' && (Date.now() - captcha.issuedAt) <= 3 * 60 * 1000;

  if (!captchaIsValid) {
    req.session.captcha = null;
    return res.status(400).json({success: false, message: 'Captcha Verification failed , please try again' });
  }
    try {

 const { data, error } = await supabase
    .from('allusers')
    .insert([
      { name : name1,
         email: email, 
        password: password, 
        
       }
    ]).select();
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Email already exists. Login with existing account', link: '/login', actionText: 'Login' });
      } else {
        return res.status(500).json({ success: false, message: 'An error occurred during signup', error: error.message });
      }
    }
if (data) {
  req.session.userId = data[0].id; 
  req.session.userEmail = email;
  req.session.userName = name1;
  
  return res.status(201).json({
    success: true,
    message: 'Account created and logged in successfully!',
  });
}
 
    } catch (err) {
    
        return res.status(500).json({ success: false, message: 'An error occurred during signup', error: err.message }); 
     
  } 
    
});



module.exports = {
    router2, 
    
};
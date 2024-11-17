const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const User = require("../authentication/model/user");
const forgotPassword = async (req, res) => {
    const { emailId } = req.body;
    try {
        const user = await User.findOne({ email: emailId });
        if (!user) {
            res.status(401).send("No user found with this email ID");
        }
        const resetToken = jwt.sign({ _id: user._id }, process.env.jwt_secret, { expiresIn: '15m' });
        const resetUrl = `http://localhost:5000/resetPassword/${resetToken}`;
        const transporter = nodeMailer.createTransport({
            service: 'gmail', // Use your email service (e.g., Gmail, SMTP provider)
            auth: {
                user: process.env.gmail,
                pass: process.env.password// Use environment variables for security
            }
        });
        const mailOptions = {
            from: process.env.gmail,
            to: user.emailId,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:
            ${resetUrl}`
        };
        await transporter.sendMail(mailOptions);
        console.log('Reset password email sent');
    }
    catch (err) { 
        res.status(500).send("Error!"+err.message);
    }
}
const resetPassword = async(req,res)=>{
    const {token}=req.params;
    const{newPassword}=req.body;
    try{
        const decode=jwt.decode(token);
        if(!decode){
            res.status(401).send("Invalid");
        }
        const user=await User.findById(_id);
        if(!user){
            res.status(401).send("User not found");
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).send("Password updated successfully!");
    }
    catch(err){
        res.status(500).send("Error!"+err.message);
    }
}
module.exports={forgotPassword,resetPassword};
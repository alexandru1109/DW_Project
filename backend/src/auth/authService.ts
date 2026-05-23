import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class AuthService {
  private createTransporter = async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    return transporter;
  };

  public async register(name: string, email: string, password: string, role: string, strategy: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email,
      passHash,
      role,
      strategy,
      isVerified: true, // AUTO-VERIFY FOR LOCAL DEV
      verificationToken
    });

    await user.save();
    console.log(`[DEV] User registered. Verification token: ${verificationToken}`);
    // await this.sendVerificationEmail(user.email, verificationToken); // Skip email for dev

    return user;
  }

  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`[DEV] Verification Link: http://${process.env.HOST}/api/auth/verify/${token}`);
    const transporter = await this.createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Account Verification',
      text: `Please verify your account by clicking the link: 
      http://${process.env.HOST}/api/auth/verify/${token}`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  public async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = await this.createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('OTP email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }
  }

  public async verifyUser(token: string): Promise<void> {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
  }

  public async login(email: string, password: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`[DEV] Login OTP for ${email}: ${otp}`);
    await this.sendOtpEmail(user.email, otp);
  }

  public async verifyOtp(email: string, otp: string): Promise<string> {
    const user = await User.findOne({ email, otp, otpExpiry: { $gte: new Date() } });
    if (!user) {
      throw new Error('Invalid or expired OTP');
    }

    user.otp = '';
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return token;
  }

  public async requestPasswordChange(email: string, newPassword: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User with this email does not exist');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.tempNewPassword = await bcrypt.hash(newPassword, 10); // Temporarily store hashed password
    console.log(`Temp password set for user ${email}: ${user.tempNewPassword}`); // Debug
    console.log(`OTP generated: ${otp}`); // Debug
    await user.save();

    await this.sendOtpEmail(user.email, otp); // Send OTP via email
}

  
public async confirmPasswordChange(email: string, otp: string): Promise<void> {
  const user = await User.findOne({ email, otp, otpExpiry: { $gte: new Date() } });
  if (!user) {
      console.log(`User not found or OTP invalid for email: ${email}`); // Debug
      throw new Error('Invalid or expired OTP');
  }

  if (!user.tempNewPassword) {
      console.log(`No temp password found for email: ${email}`); // Debug
      throw new Error('No password change requested');
  }

  user.passHash = user.tempNewPassword; // Update with the new password
  user.tempNewPassword = undefined; // Clear temporary password
  user.otp = '';
  user.otpExpiry = undefined;

  console.log(`Password updated successfully for email: ${email}`); // Debug
  await user.save();
}

  
}

export default new AuthService();
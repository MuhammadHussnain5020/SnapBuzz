import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

export const signup = async (req, res, next) => {
  const { username, email, phone, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user instance
    const user = new User({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Send a success response
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error during signup:", err); // Log the full error details

    // Check if it's a Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: "Validation error", details: err.errors });
    }

    // Generic error response
    return res
      .status(500)
      .json({ message: "Error saving user", error: err.message });
  }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching user' });
    }

    if (!existingUser) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({ userId: existingUser._id, email: existingUser.email, token });
};
export const getUserData = async (req, res) => {
    try {
        const {email} = req.body;
        console.log(email);
        const user = await User.findOne({email}).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
};

// Forget Password Functionality
export const forgetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error("Error during password reset:", err);

        // Check if it's a Mongoose validation error
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: 'Validation error', details: err.errors });
        }

        // Generic error response
        return res.status(500).json({ message: 'Error updating password', error: err.message });
    }
};

export const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    res.status(200).json({ message: "Email exists" });
  } catch (err) {
    console.error("Error during email verification:", err);

    // Generic error response
    return res
      .status(500)
      .json({ message: "Error verifying email", error: err.message });
  }
};


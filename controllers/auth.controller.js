import User from "../models/user.model.js";
import Token from "../models/token.model.js";
import { generateTokens } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password });
    const tokens = await generateTokens(user._id);

    res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: true });
    res.status(201).json({ message: "User registered", accessToken: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const tokens = await generateTokens(user._id);
    res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    await Token.findOneAndDelete({ token: req.cookies.refreshToken });
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};